// screept run to create users
//  node scripts/seedUsers.js

const mongoose = require("mongoose");
const { bulkRegisterSchema } = require("../helpers/joiValidatior");
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const { creatUserName } = require("../controllers/authController");

require("dotenv").config();

// 🔥 change DB
const MONGO_URL = process.env.DB_URL;

const firstNames = [
  "Amit",
  "Bharat",
  "Charan",
  "Deepak",
  "Eshan",
  "Farhan",
  "Gokul",
  "Hari",
  "Imran",
  "Jatin",
  "Kiran",
  "Lokesh",
  "Manoj",
  "Naveen",
  "Omkar",
  "Praveen",
  "Qadir",
  "Rakesh",
  "Sanjay",
  "Tarun",
  "Uday",
  "Varun",
  "Wasim",
  "Xavier",
  "Yash",
  "Zubin",
  "Nagaraj",
];

// 🚀 BULK REGISTER
const registerBulk = async (req, res) => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ DB Connected");

    const users = [];

    for (let i = 0; i < 200; i++) {
      const name = firstNames[i % firstNames.length];
      const id = i + 1;

      users.push({
        user: `${name} Kumar`,
        userName: `${name.toLowerCase()}${id}`, // amit1, bharat2...
        mobileNumber: `9${String(100000000 + id).slice(0, 9)}`,
        email: `${name.toLowerCase()}${id}@example.com`,
        password: "123456",
      });
    }

    // 1️⃣ Must be array
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Users array required" });
    }

    // 2️⃣ Validate
    const { error, value } = bulkRegisterSchema.validate(users);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    // 3️⃣ Collect emails & usernames
    const emails = value.map((u) => u.email).filter(Boolean);
    const usernames = value.map((u) => u.userName);

    // 4️⃣ Single query for duplicates (FAST)
    const existingUsers = await User.find({
      $or: [{ email: { $in: emails } }, { userName: { $in: usernames } }],
    });

    const existingEmailSet = new Set(existingUsers.map((u) => u.email));
    const existingUserNameSet = new Set(existingUsers.map((u) => u.userName));

    const preparedUsers = [];
    const skipped = [];

    // 5️⃣ Prepare users
    for (const u of value) {
      if (
        existingEmailSet.has(u.email) ||
        existingUserNameSet.has(u.userName)
      ) {
        skipped.push({
          email: u.email,
          userName: u.userName,
          reason: "Already exists",
        });
        continue;
      }

      const hashPassword = await bcrypt.hash(u.password, 12);

      preparedUsers.push({
        user: u.user?.trim(),
        userName: creatUserName(u.userName),
        email: u.email,
        mobileNumber: u.mobileNumber,
        password: hashPassword,
      });
    }

    // 6️⃣ Bulk insert
    const created = await User.insertMany(preparedUsers);

    console.log(
      `🎉 ${created.length} users inserted successfully ${skipped.length} users skipped`
    );

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

registerBulk();
