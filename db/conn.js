// const mongoose = require("mongoose");
// require("dotenv").config();

// const connectDB = async () => {
//   try {
//     // Replace this with the actual nodes provided by Atlas
//     const DB_URL =
//       "mongodb://mithunkj1996_db_user:KK42CDa6OCwly5Jf@cluster0-shard-00-00.2bfh3qx.mongodb.net:27017,cluster0-shard-00-01.2bfh3qx.mongodb.net:27017,cluster0-shard-00-02.2bfh3qx.mongodb.net:27017/shareurinterestdev?ssl=true&replicaSet=atlas-xxxxxx-shard-0&authSource=admin&retryWrites=true&w=majority";

//     // const DB_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/MYINTREST";

//     await mongoose.connect(DB_URL, {
//       serverSelectionTimeoutMS: 10000,
//     });

//     console.log("✅ MongoDB connected");
//   } catch (error) {
//     console.error("❌ MongoDB connection failed:", error.message);
//     process.exit(1); // STOP APP if DB fails
//   }
// };

// module.exports = connectDB;

const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const DB_URL =
      "mongodb+srv://mithunkj1996_db_user:KK42CDa6OCwly5Jf@cluster0.2bfh3qx.mongodb.net/shareurinterestdev?retryWrites=true&w=majority";

    await mongoose.connect(DB_URL, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    // await mongoose.connect(process.env.DB_URL, {
    //   serverSelectionTimeoutMS: 10000,
    //   family: 4, // IMPORTANT for Hostinger (IPv4 fix)
    // maxPoolSize: 10,
    // });

    console.log("✅ MongoDB connected to shareurinterestdev");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
