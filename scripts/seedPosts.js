// screept run to create post
// node scripts/seedPost
const mongoose = require("mongoose");
const post = require("../model/post");
const User = require("../model/userModel")
require("dotenv").config();

// 🔥 change DB
const MONGO_URL = process.env.DB_URL;

const sampleImages = [
  "/sample1.jpeg",
  "/sample2.jpeg",
  "/sample3.jpeg",
  "/sample4.jpeg",
  "/sample5.jpeg",
];

// helper → random image
const randomImage = () =>
  sampleImages[Math.floor(Math.random() * sampleImages.length)];

async function seedPosts() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ DB Connected");

  const basePath = `/public`;


    // 🚀 STEP 1 — find all users
    const users = await User.find().select("_id userName");

    if (!users.length) {
      console.log("❌ No users found");
      process.exit();
    }

    console.log(`Users found: ${users.length}`);

    const posts = [];
    console.log(randomImage())
    // 🚀 STEP 2 — prepare posts in memory
    users.forEach((user) => {
      // EXACTLY 2 posts per user
      for (let i = 1; i <= 2; i++) {
        posts.push({
          body: `Post ${i} by ${user.userName}`,

          photo: `${basePath}/${randomImage()}`,
          //  [
          //   randomImage(),
          //   randomImage(), // 2 images per post
          // ],

          postedBy: user._id,

          location: {
            type: "Point",
            coordinates: [12.9076, 77.6135],
          },
        });
      }
    });

    console.log(`Preparing ${posts.length} posts...`);

    // 🚀 STEP 3 — bulk insert (FAST)
    await post.insertMany(posts);

    console.log(`🎉 ${posts.length} posts inserted successfully`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedPosts();
