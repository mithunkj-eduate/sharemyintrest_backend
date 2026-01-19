const express = require("express");
const mongoose = require("mongoose");
const Post = require("../model/post");
const expressAsyncHandler = require("express-async-handler");

//create post
createPost = expressAsyncHandler(async (req, res) => {
  const { title, pic } = req.body;
  if (!title || !pic) {
    res.status(442);
    throw new Error("please add all fields");
  }
  //req.user;
  const post = new Post({
    body: req.body.title,
    photo: req.body.pic,
    postedBy: req.user,
  });
  post
    .save()
    .then((result) => {
      return res.json({ post: result });
    })
    .catch((err) => console.log(err));
});

//create new post store in local storage
createNewPost = expressAsyncHandler(async (req, res) => {
  // const basePath = `${req.protocol}://${req.get("host")}/public`;
  const basePath = `/public`;

  if (req.file == undefined) {
    res.status(404);
    throw new Error("required image");
  }
  // const expirationTime = new Date(Date.now() + 30 * 1000); // 1 hour from now 60 * 60 * 1000

  let post;
  if (!req.file?.filename) {
    post = new Post({
      body: req.body.title,
      postedBy: req.user,
      location: {
        type: "Point",
        coordinates: [12.907637572103615, 77.61350705305202],
      },
    });
  } else {
    post = new Post({
      body: req.body.title,
      photo: `${basePath}/${req.file.filename}`,
      postedBy: req.user,
      location: {
        type: "Point",
        coordinates: [12.907637572103615, 77.61350705305202],
      },
      // expirationTime: expirationTime,
    });
  }
  post.save();

  // // Create TTL index on the expirationTime field
  // await Post.collection.createIndex(
  //   { "expirationTime": 1 },
  //   { expireAfterSeconds: 0 }
  // );
  res.json({ title: "Post created", data: post });
});

//get allpost
allposts = expressAsyncHandler(async (req, res) => {
  let limit = req.query.limit;
  let skip = req.query.skip;

  //find all posts
  const allPost = await Post.find()
    .populate("postedBy", "_id userName user Photo  followers following")
    .populate("comments.postedBy", "_id userName user Photo createdAt")
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .sort("-createdAt");
  // const highLike = await Post.aggregate([
  //   { $unwind: "$likes" },
  //   { $sortByCount: "$likes" },
  // ]);

  // console.log("allpost", allPost);
  // console.log("hightLikes", highLike);

  //get centerSphere [ [lagirudinal,latitudinal], radias ] == [ [12.910572547882472, 77.58911221181634], 50 / 6371 ]
  //eart radias = 6371
  // 50km is equal 50/6371
  //radias of circal 50km
  const nearCenterSphereLocation = await Post.find({
    location: {
      $geoWithin: {
        $centerSphere: [[12.910572547882472, 77.58911221181634], 50 / 6371],
      },
    },
  })
    .populate("postedBy", "_id userName user Photo  followers following")
    .populate("comments.postedBy", "_id userName user Photo createdAt")
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .sort("-createdAt");

  res.json({ title: "ALl Posts", data: allPost });
  // res.json({ title: "ALl Posts", data: nearCenterSphereLocation });
});

//get auth post
mypost = expressAsyncHandler(async (req, res) => {
  const mypost = await Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id userName user")
    .populate("comments.postedBy", "_id userName user")
    .sort("-createAt");
  res.json({ title: "My Post", data: mypost });
});

//update add like
likepost = expressAsyncHandler(async (req, res) => {
  if (!req.body.postId) {
    res.status(404);
    throw new Error("Post not found");
  }
  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    { new: true }
  )
    .populate("postedBy", "_id userName Photo user")
    .populate("comments.postedBy", "_id userName Photo user createdAt");

  res.json({ title: "Like", data: post });
});

//update remove the like
unlikepost = expressAsyncHandler(async (req, res) => {
  if (!req.body.postId) {
    res.status(404);
    throw new Error("Post not found");
  }
  const post = await Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    { new: true }
  )
    .populate("postedBy", "_id userName Photo user")
    .populate("comments.postedBy", "_id userName Photo user createdAt");

  res.json({ title: "unlike", data: post });
});

//update add comment
commentPost = expressAsyncHandler(async (req, res) => {
  if (!req.body.postId) {
    res.status(404);
    throw new Error("Post not found");
  }
  if (!req.body.text) {
    res.status(404);
    throw new Error("Please enter comment");
  }
  const comment = {
    comment: req.body.text,
    postedBy: req.user._id,
  };

  const commentData = await Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    { new: true }
  )
    .populate("comments.postedBy", "_id userName Photo user createdAt")
    .populate("postedBy", "_id userName Photo user");

  res.json({ title: "All comments", data: commentData });
});

//delete the post
deletePost = expressAsyncHandler(async (req, res) => {
  const deleteSinglePost = await Post.findById(req.params.postId).populate(
    "postedBy",
    "_id"
  );

  if (!deleteSinglePost) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (deleteSinglePost.postedBy._id.toString() === req.user._id.toString()) {
    const deletePost = await Post.findByIdAndDelete(req.params.postId);

    res.json({ title: "deleted post", data: deletePost });
  } else {
    res.status(401);
    res.send("unauthorized user");
  }
});

//getsingle post
getPost = expressAsyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "postedBy",
    "userName Photo"
  );
  if (post == null) {
    res.status(404);
    throw new Error("post not found");
  }

  res.json({ title: "single post", data: post });
});

module.exports = {
  createPost,
  createNewPost,
  allposts,
  mypost,
  likepost,
  unlikepost,
  commentPost,
  deletePost,
  getPost,
};
