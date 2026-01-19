const mongoose = require("mongoose");

require("dotenv").config();

const db_url = process.env.db_url;

const connectDB = async () => {
  try {
    mongoose.connect(db_url ? db_url : "mongodb://127.0.0.1:27017/MYINTREST");
    // mongoose.connect("mongodb+srv://mithunkj1996:xCp1axpfIP50MnsI@cluster0.t8wowol.mongodb.net/MYINTREST");
    console.log("Connected to mongodb");
  } catch (error) {
    console.log(`connect filed :${err}`);
    next(err);
  }
};

module.exports = connectDB;
