const express = require("express");
const mongoose = require("mongoose");
const Post = require("../model/post");
const User = require("../model/userModel");
const Story = require("../model/storyModel");
const expressAsyncHandler = require("express-async-handler");

//get single user
getUser = expressAsyncHandler(async (req, res) => {
  let limit = req.query.limit;
  let skip = req.query.skip;
  const userDetail = await User.findById(req.params.id)
    .select("-password")
    .populate("following", "userName Photo user story")
    .populate("followers", "userName Photo user");

  const userPosts = await Post.find({ postedBy: req.params.id })
    .populate("postedBy", "_id ")
    .populate("comments.postedBy", "userName Photo user createdAt")
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .sort("-createdAt");
  const postLength = await Post.find({ postedBy: req.params.id });

  //get all user stories
  const Stories = await Story.find({ postedBy: req.params.id });

  res.json({
    user: userDetail,
    post: userPosts,
    postLength: postLength.length,
    stories: Stories,
  });
});

//update add follower in followerslist
follow = expressAsyncHandler(async (req, res) => {
  const follower = await User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    { new: true }
  )
    .select("-password")
    .populate("following", "userName Photo user")
    .populate("followers", "userName Photo user");
  const following = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: { following: req.body.followId },
    },
    { new: true }
  );

  res.json({ title: "follower", data: follower });
});

//update remove follower from followeer list
unfollow = expressAsyncHandler(async (req, res) => {
  const follower = await User.findByIdAndUpdate(
    req.body.followId,
    {
      $pull: { followers: req.user._id },
    },
    { new: true }
  )
    .select("-password")
    .populate("following", "userName Photo user")
    .populate("followers", "userName Photo user");
  const following = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { following: req.body.followId },
    },
    { new: true }
  );

  res.json({ title: "unfollow", data: follower });
});

//get all follower post max liks and comments and max followers
followingpost = expressAsyncHandler(async (req, res) => {
  let limit = req.query.limit;
  let skip = req.query.skip;

  //maxlikes in post list aggregate method
  const maxLikesPosts = await Post.aggregate([
    { $project: { _id: 1, likesCount: { $size: "$likes" } } }, // Project the _id and the size of the likes array
    { $group: { _id: "$likesCount", ids: { $push: "$_id" } } }, // Group documents by likesCount and push _id values into an array
    { $sort: { _id: -1 } }, // Sort documents by likesCount in descending order
    { $limit: 1 }, // Limit the result to only the group with the maximum likesCount
  ]);

  //maxcomments in post list aggregate method
  const maxCommentsPosts = await Post.aggregate([
    { $project: { _id: 1, commentsCount: { $size: "$comments" } } }, // Project the _id and the size of the comments array
    { $group: { _id: "$commentsCount", ids: { $push: "$_id" } } }, // Group documents by commentsCount and push _id values into an array
    { $sort: { _id: -1 } }, // Sort documents by commentsCount in descending order
    { $limit: 1 }, // Limit the result to only the group with the maximum commentsCount
  ]);

  //maxfollowers in post list aggregate method
  const maxFollowersPosts = await User.aggregate([
    { $project: { _id: 1, followersCount: { $size: "$followers" } } }, // Project the _id and the size of the followers array
    { $group: { _id: "$followersCount", ids: { $push: "$_id" } } }, // Group documents by followersCount and push _id values into an array
    { $sort: { _id: -1 } }, // Sort documents by followersCount in descending order
    { $limit: 1 }, // Limit the result to only the group with the maximum followersCount
  ]);

  const followingpost = await Post.find({
    $or: [
      { postedBy: { $in: req.user.following } }, //all following posts
      { likes: { $in: req.user.following } }, //all following like posts
      { "comments.postedBy": { $in: req.user.following } }, //all following comment posts
      { _id: { $in: maxLikesPosts[0].ids } }, //max like posts
      { _id: { $in: maxCommentsPosts[0].ids } }, // max comment posts
      { postedBy: { $in: maxFollowersPosts[0].ids } }, //max followers posts
    ],
  })
    .populate("postedBy", "_id userName Photo user")
    .populate("comments.postedBy", "_id userName Photo user createdAt")
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .sort("-createdAt");

  // const followingposts = await Post.find({
  //   likes: { $in: req.user.following },
  // })
  //   .populate("postedBy", "_id userName Photo user")
  //   .populate("comments.postedBy", "_id userName Photo user createdAt")
  //   .skip(parseInt(skip))
  //   .limit(parseInt(limit))
  //   .sort("-createdAt");
  // console.log(followingposts, "line no 102");

  

  const postLength = await Post.find({
    postedBy: { $in: req.user.following },
  });

  //find all following storys
  const following = await User.find(req.user._id)
    .populate("following", "userName Photo user story")
    .select("-password");


  //update views count in posts
  let postsIds = [];
  followingpost.map(async (posts) => {
    postsIds.push(posts._id);
  });

  const updateViews = await Post.updateMany(
    { _id: { $in: postsIds } },
    { $push: { views: req.user._id } }
  );

  res.json({
    title: "followingpost",
    data: followingpost,
    postLength: postLength.length,
    following: following,
  });
});

//upload profile pic
uploadProfilePic = expressAsyncHandler(async (req, res) => {
  // const basePath = `${req.protocol}://${req.get("host")}/public`;
  const basePath = `/public`;

  if (req.file == undefined) {
    res.status(404);
    throw new Error("required image");
  }

  const profilePic = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { Photo: `${basePath}/${req.file.filename}` },
    },
    { new: true }
  );
  res.json({ title: "Added profile pic", data: profilePic });
});

//followlist get all following list
followList = expressAsyncHandler(async (req, res) => {
  const follower = await User.find(req.user._id)
    .populate("following", "userName Photo user")
    .select("userName");

  res.json({ title: "follow list", data: follower });
});

//search user ,username and post title
searchUser = expressAsyncHandler(async (req, res) => {
  const { key } = req.query;

  if (!key) {
    res.status(442);
    throw new Error("Please add search key");
  }
  const result = await User.find({
    $or: [
      { user: { $regex: key, $options: "i" } },
      {
        userName: { $regex: key, $options: "i" },
      },
    ],
  });
  const post = await Post.find({ body: { $regex: key, $options: "i" } });
  // .limit(15)
  // .skip(15);

  res.json({ title: "Search Result", user: result, post: post });
});

//get all userinfo
getUsers = expressAsyncHandler(async (req, res) => {
  const users = await User.find().select("userName user _id Photo");
  res.json({ title: "all user", data: users });
});

//update story
createStory = expressAsyncHandler(async (req, res) => {
 
  // const expirationTime = new Date(Date.now() + 30 * 1000); // 1 hour from now 60 * 60 * 1000
  // console.log(expirationTime, "line no 239");

  // const basePath = `${req.protocol}://${req.get("host")}/public`;
  const basePath = `/public`;

  const story = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        story: {
          $each: [
            {
              title: req.body.title,
              image: `${basePath}/${req.file.filename}`,
              // expirationTime: expirationTime,
            },
          ],
        },
      },
    },
    { new: true }
  );

  res.json({ title: "story is create", data: story });
});

//delete story
deleteStory = expressAsyncHandler(async (req, res) => {

  const story = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { story: { _id: req.body.storyId } },
    },
    { new: true }
  );

  res.send(story);
});

module.exports = {
  getUser,
  follow,
  unfollow,
  followingpost,
  uploadProfilePic,
  followList,
  searchUser,
  getUsers,
  createStory,
  deleteStory,
};
