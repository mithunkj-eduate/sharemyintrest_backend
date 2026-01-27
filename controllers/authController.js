const express = require("express");
const User = require("../model/userModel");
const Post = require("../model/post");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const expressAsyncHandler = require("express-async-handler");
const registerSchema = require("../helpers/joiValidatior");

require("dotenv").config();

const refresh = process.env.JWT_SECRET;

//unique user name create
const creatUserName = (data) => {
  let val = Math.floor(1000 + Math.random() * 9000);
  let userName = data.trim().split(" ").join("");

  let secondSlice;
  let randomNum;
  let firstSlice;
  if (userName.length < 11) {
    randomNum = Math.floor(Math.random() * (userName.length - 1)) + 1;
    firstSlice = userName.slice(0, randomNum);
    secondSlice = userName.slice(randomNum, userName.length);
  } else {
    randomNum = Math.floor(Math.random() * 6) + 1;
    firstSlice = userName.slice(0, randomNum);
    secondSlice = userName.slice(randomNum, 10);
  }

  function makeid(length) {
    let result = "";
    const characters = "._";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
  newName = firstSlice + makeid(1) + secondSlice + val;
  return newName;
};

const register = expressAsyncHandler(async (req, res) => {
  const value = await registerSchema(req.body);
  if (value.error) {
    res.status(400);
    throw new Error(value.error.details[0].message);
  }

  const existUser = await User.find({
    $or: [{ email: req.body.email }, { userName: req.body.userName }],
  });
console.log(existUser,"exitingUser")
  if (existUser.length > 0) {
    res.status(400);
    throw new Error("user already present");
  }

  const hashPassword = await bcrypt.hash(req.body.password, 12);

  const newUser = await User.create({
    user: req.body.user.trim(),
    userName: creatUserName(req.body.userName),
    password: hashPassword,
    email: req.body.email,
    mobileNumber: req.body.mobileNumber,
  });

  res.status(201).json({
    title: "New user has been created",
    data: newUser,
  });
});

//login user
const login = expressAsyncHandler(async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(404).send({ message: "user not found" });
  }
  const user = await User.findOne({ email: req.body.email });

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    const token = jwt.sign({ userId: user._id }, refresh);
    const { _id, userName, email, Photo } = user;


    res.json({
      user: { _id, userName, email, Photo },
      token: token,
    });
  } else {
    res.status(404).send({ message: "user not found" });
  }
});

//googleLogin
const googleLogin = expressAsyncHandler(async (req, res) => {
  const { email_verified, name, userName, email, Photo, clientId } = req.body;

  if (email_verified) {
    const existUser = await User.findOne({ email: email });
    if (existUser) {
      const token = jwt.sign({ userId: existUser._id }, refresh);
      const { _id, name, userName, email, Photo } = existUser;
      res.json({
        user: { _id, name, userName, email, Photo },
        token: token,
      });
    } else {
      const password = req.body.email + req.body.clientId;
      const hashPassword = await bcrypt.hash(password, 12);
      const newUser = await User.create({
        name: req.body.name,
        userName: creatUserName(req.body.userName),
        email: req.body.email,
        password: hashPassword,
        Photo: req.body.Photo,
      });
      let userId = newUser._id.toString();
      const token = jwt.sign({ userId: userId }, refresh);
      const { _id, name, userName, email, Photo } = newUser;
      res.json({
        user: { _id, name, userName, email, Photo },

        token: token,
      });
    }
  }
});

module.exports = {
  register,
  login,
  googleLogin,
};
