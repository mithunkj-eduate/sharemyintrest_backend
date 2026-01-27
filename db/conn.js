const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const DB_URL =
      process.env.DB_URL || "mongodb://127.0.0.1:27017/MYINTREST";

    await mongoose.connect(DB_URL, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // STOP APP if DB fails
  }
};

module.exports = connectDB;
