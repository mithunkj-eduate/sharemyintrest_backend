// // node scripts/clearDB

// const mongoose = require("mongoose");
// require("dotenv").config();

// const User = require("../model/userModel");
// const Post = require("../model/post");
// const Message = require("../model/messageModel");

// const MONGO_URL = process.env.DB_URL;

// async function clearDB() {
//   try {
//     await mongoose.connect(MONGO_URL_1);
//     console.log("✅ DB Connected");

//     await Promise.all([
//       User_1.deleteMany({}),
//       Post_1.deleteMany({}),
//       Message_1.deleteMany({}),
//     ]);

//     console.log("🔥 All users & posts deleted");
//     console.log("Database cleaned successfully");

//     process.exit();
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// }

// clearDB();
