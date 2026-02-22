const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../model/userModel");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const requiredLogin = async (req, res, next) => {
  const { authorization } = req.headers;
console.log(authorization,"authorization")
  if (!authorization) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authorization.replace("Bearer ", "");

    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
console.log(payload,"payload")
    const user = await userModel.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (err) {
    // 🔥 Just send 401
    return res.status(401).json({ message: "Unauthorized" });
  }
};


module.exports = requiredLogin;
