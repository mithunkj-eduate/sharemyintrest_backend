const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../model/userModel");
require("dotenv").config();

const Jwt_swcret = process.env.Jwt_swcret;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "You must have logged in 1" });
  }
  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, Jwt_swcret, (err, payload) => {
    if (err) {
      return res.status(401).json(err);
    }
    const { userId } = payload;

    userModel.findById(userId).then((userdata) => {
      req.user = userdata;
      if (req.user === null) {
        res.status(401).json({ message: "authentication failed" });
      } else {
        next();
      }
    });
  });
};
