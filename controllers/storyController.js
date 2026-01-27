const express = require("express");
const mongoose = require("mongoose");
const Story = require("../model/storyModel");
const expressAsyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const path = require("path");

//create new story
const createNewStory = expressAsyncHandler(async (req, res) => {
  // const basePath = `${req.protocol}://${req.get("host")}/public`;
  const basePath = `/public`;

  if (req.file == undefined) {
    res.status(404);
    throw new Error("required image");
  }
  const expirationTime = new Date(Date.now() + 60 * 60 * 24 * 1000); // 1 hour from now 60 * 60 * 1000

  let story;
  if (!req.file?.filename) {
    story = new Story({
      body: req.body.title,
      postedBy: req.user,
      expirationTime: expirationTime,
    });
  } else {
    story = new Story({
      body: req.body.title,
      photo: `${basePath}/${req.file.filename}`,
      postedBy: req.user,
      expirationTime: expirationTime,
    });
  }
  story.save();

  // Create TTL index on the expirationTime field
  await Story.collection.createIndex(
    { expirationTime: 1 },
    { expireAfterSeconds: 0 }
  );
  res.json({ title: "Post created", data: story });
});

//get all followers stories
const allStories = expressAsyncHandler(async (req, res) => {
  const stories = await Story.aggregate([
    {
      $match: {
        postedBy: { $in: req.user.following },
      },
    },
    {
      $lookup: {
        from: "users", // Name of the collection to perform the join with
        localField: "postedBy", // Field from the input documents
        foreignField: "_id", // Field from the documents of the "users" collection
        as: "postedByUser", // Output array field containing the joined documents
      },
    },
    {
      $unwind: "$postedByUser", // Deconstructs the "postedByUser" array field created by $lookup
    },
    {
      $project: {
        _id: 1,
        photo: 1,
        likes: 1,
        postedBy: {
          _id: "$postedByUser._id",
          userName: "$postedByUser.userName", // Include the name field from the joined user document
          Photo: "$postedByUser.Photo",
        }, // Replace the "postedBy" field with the joined user document
      },
    },
    {
      $group: {
        _id: "$postedBy",
        posts: { $push: "$$ROOT" },
      },
    },
  ]);

  res.json({ title: "All stories", data: stories });
});

//get story
const getStory = expressAsyncHandler(async (req, res) => {
  const story = await Story.find({ postedBy: req.query.storyUserId });

  const ids = [];
  for (let i = 0; i < story.length; i++) {
    ids.push(story[i]._id);
  }

  //update viewer ids in story
  const updateStoryViews = await Story.updateMany(
    { _id: { $in: ids } },
    {
      $addToSet: { views: req.query.userId },
    },
    { new: true }
  );

  res.json({ title: "Story", data: story });
});

//story viewers list
const storyViewerslist = expressAsyncHandler(async (req, res) => {
  //find story by story id
  const story = await Story.findById(req.params.id);

  //find vierws by viewrs list of ids
  const viewers = await User.find(
    { _id: { $in: story.views } },
    { userName: 1, Photo: 1 }
  );

  res.json({ title: "All viewers list", data: viewers });
});

module.exports = {
  createNewStory,
  allStories,
  getStory,
  storyViewerslist,
};
