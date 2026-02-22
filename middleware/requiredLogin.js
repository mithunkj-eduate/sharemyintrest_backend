require("dotenv").config();

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../model/userModel");

const ACCESS_TOKEN_SECKRET = process.env.ACCESS_TOKEN_SECKRET;

const requiredLogin = async (req, res, next) => {
  const { authorization } = req.headers;
console.log(authorization,"authorization")
  if (!authorization) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authorization.replace("Bearer ", "");

    const payload = jwt.verify(token, ACCESS_TOKEN_SECKRET);
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
