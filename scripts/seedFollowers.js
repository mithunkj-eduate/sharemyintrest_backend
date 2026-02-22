// node scripts/seedFollowers
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../model/userModel");

const MONGO_URL = process.env.DB_URL;

// helper → random number
const random = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// shuffle helper
const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());

async function seedFollowers() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ DB Connected");

    const users = await User.find().select("_id");

    if (!users.length) {
      console.log("❌ No users found");
      process.exit();
    }

    console.log(`Users found: ${users.length}`);

    const bulkOps = [];

    users.forEach((user) => {
      // each user follows 5–25 random users
      const followCount = random(5, 100);

      const shuffled = shuffle(users);

      const toFollow = shuffled
        .filter((u) => !u._id.equals(user._id)) // ❌ no self follow
        .slice(0, followCount);

      const followingIds = toFollow.map((u) => u._id);

      // update following list
      bulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: {
            $addToSet: { following: { $each: followingIds } },
          },
        },
      });

      // update followers list
      toFollow.forEach((target) => {
        bulkOps.push({
          updateOne: {
            filter: { _id: target._id },
            update: {
              $addToSet: { followers: user._id },
            },
          },
        });
      });
    });

    console.log(`Preparing ${bulkOps.length} updates...`);

    await User.bulkWrite(bulkOps);

    console.log("🎉 Random followers added successfully");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedFollowers();
