const express = require("express");
const mongoose = require("mongoose");
const Message = require("../model/messageModel");
const expressAsyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const path = require("path");
const fs = require("fs");

createMessage = expressAsyncHandler(async (req, res) => {
  const createMessage = await Message.create({});
  res.send("fdsnksdjf");
});

//create new message
createMessage = expressAsyncHandler(async (req, res) => {
  // const basePath = `${req.protocol}://${req.get("host")}/public`;
  const basePath = `/public`;

  //   if (req.file == undefined) {
  //     res.status(404);
  //     throw new Error("required image");
  //   }
  const { receivedBy, title, link } = req.body;

  if (!receivedBy) {
    res.status(404);
    throw new Error("required receivedBy");
  }

  let message;
  if (typeof receivedBy === "string") {
    if (!req.file?.filename) {
      message = new Message({
        body: title,
        postedBy: req.user._id,
        receivedBy: receivedBy,
        link: link,
      });
    } else {
      message = new Message({
        body: title,
        postedBy: req.user._id,
        receivedBy: receivedBy,
        link: link,
        photo: `${basePath}/${req.file.filename}`,
      });
    }

    message.save();
  } else {
    let messagesList = [];
    for (let i = 0; i < receivedBy.length; i++) {
      const messageData = {
        body: title,
        postedBy: req.user._id,
        receivedBy: receivedBy[i],
        link: link,
      };
      messagesList.push(messageData);
    }

    //create multiple message
    message = await Message.insertMany(messagesList);
  }

  res.json({ title: "message created", data: message });
});

//get messages
getMessages = expressAsyncHandler(async (req, res) => {
  if (!req.query.receivedBy) {
    res.status(404);
    throw new Error("required receivedBy");
  }
  const messages = await Message.find({
    $or: [
      {
        postedBy: req.user._id,
        receivedBy: req.query.receivedBy,
      },
      {
        postedBy: req.query.receivedBy,
        receivedBy: req.user._id,
      },
    ],
  }).populate("postedBy receivedBy", "userName Photo");

  res.json({ title: "All messages", data: messages });
});

//download image
downloadFile = expressAsyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error("not found messgae");
  }

  if (message.photo) {
    //url image split get filename url http://localhost:8000/public/20200630_0601591714114545840.jpg
    const fileName = message.photo.split("public/");

    //image path
    const imagePath = path.join(__dirname, `../public/${fileName[1]}`);

    // Read the image file
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.error("Error reading image file:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      // Send the image file as a response
      res.contentType("image/jpeg");
      res.send(data);
    });
  } else {
    res.status(404).send("File not found");
  }
});

module.exports = { createMessage, getMessages, downloadFile };
