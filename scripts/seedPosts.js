// screept run to create post
// node scripts/seedPost
const mongoose = require("mongoose");
const Post = require("../model/post");
const User = require("../model/userModel");
require("dotenv").config();

const MONGO_URL = process.env.DB_URL;

const basePath = "/public";

// ------------------
// images
// ------------------
const sampleImages = [
  "/sample1.jpeg",
  "/sample2.jpeg",
  "/sample3.jpeg",
  "/sample4.jpeg",
  "/sample5.jpeg",
];

// ------------------
// sample comments
// ------------------
// const sampleComments = [
//   "Nice post 🔥",
//   "Awesome 👍",
//   "Great work",
//   "Love this ❤️",
//   "Super",
//   "Cool pic",
//   "Amazing shot",
//   "Wow",
//   "Interesting",
//   "Looks good"
// ];

const sampleComments = [
  // short reactions
  "Nice post 🔥",
  "Awesome 👍",
  "Great work",
  "Love this ❤️",
  "Super",
  "Cool pic",
  "Amazing shot",
  "Wow",
  "Interesting",
  "Looks good",

  // casual social
  "So clean 👌",
  "Beautiful capture",
  "This is dope 🔥",
  "Loved it",
  "Keep going bro",
  "Fantastic",
  "Well done",
  "Too good 😍",
  "Perfect click",
  "Next level",

  // friendly
  "Nice one buddy",
  "Great effort",
  "Proud of you",
  "This made my day",
  "So inspiring",
  "Really nice",
  "Looks awesome",
  "Impressive",
  "Good vibes ✨",
  "So aesthetic",

  // longer
  "This looks really professional",
  "I like the colors here",
  "Such a creative post",
  "You nailed it",
  "This deserves more likes",
  "Keep posting more like this",
  "Absolutely loved this one",
  "One of your best posts",
  "Super clean design",
  "Very well captured",

  // fun
  "Sheeesh 🔥",
  "OP post 😎",
  "Legend stuff",
  "Straight fire 🔥🔥",
  "Big fan of this",
  "Too smooth",
  "Can’t stop watching",
  "This is sick",
  "Crazy good",
  "Top tier content",

  // marketplace / project style (since you're building one)
  "Great quality material",
  "Looks reliable",
  "Good deal 👍",
  "Nice product",
  "Useful post",
  "Very informative",
  "This helps a lot",
  "Thanks for sharing",
  "Looks durable",
  "Solid work",

  // emojis only
  "🔥🔥🔥",
  "👏👏",
  "😍",
  "💯",
  "👌",
  "🙌",
  "❤️❤️",
  "😮",
  "✨",
  "👍👍",

  // realistic sentences
  "Where did you take this?",
  "Can you share more details?",
  "Waiting for more posts like this",
  "This is really helpful",
  "Saved this post",
  "Bookmarked 👍",
  "Nice explanation",
  "Clear and simple",
  "Very useful content",
  "Thanks bro",

  // supportive
  "Keep growing 🚀",
  "More power to you",
  "All the best",
  "Keep it up",
  "Doing great",
  "You’re improving a lot",
  "Respect 🙏",
  "Hard work paying off",
  "Brilliant",
  "Smart work",

  // generic fillers (for variety)
  "Good one",
  "Nice update",
  "Sweet",
  "Loved the vibe",
  "Looks fantastic",
  "Very cool",
  "Solid post",
  "Great stuff",
  "Amazing work",
  "Really good",
];

// helpers
const randomImage = () =>
  sampleImages[Math.floor(Math.random() * sampleImages.length)];

const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());

const randomComment = () =>
  sampleComments[Math.floor(Math.random() * sampleComments.length)];

// ------------------
async function seedPosts() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ DB Connected");

    const users = await User.find().select("_id userName");

    const userIds = users.map((u) => u._id);
    const totalUsers = userIds.length;

    if (!totalUsers) {
      console.log("❌ No users found");
      process.exit();
    }

    const posts = [];

    // -----------------------------------
    // create 2 posts per user
    // -----------------------------------
    users.forEach((user) => {
      for (let i = 1; i <= 2; i++) {
        // =========================
        // 1️⃣ VIEWS
        // =========================
        const viewCount =
          Math.floor(Math.random() * Math.min(totalUsers, 100)) + 10;

        const viewUsers = shuffle([...userIds]).slice(0, viewCount);

        // =========================
        // 2️⃣ LIKES (< views)
        // =========================
        const likeCount = Math.floor(
          Math.random() * Math.floor(viewUsers.length * 0.6)
        );

        const likeUsers = shuffle([...viewUsers]).slice(0, likeCount);

        // =========================
        // 3️⃣ COMMENTS (< likes)
        // =========================
        const commentCount = Math.floor(
          Math.random() * Math.floor(likeUsers.length * 0.5)
        );

        const commentUsers = shuffle([...likeUsers]).slice(0, commentCount);

        const comments = commentUsers.map((uid) => ({
          comment: randomComment(),
          postedBy: uid,
          date: new Date(),
        }));

        // =========================
        // FINAL POST OBJECT
        // =========================
        posts.push({
          body: `Post ${i} by ${user.userName}`,
          photo: `${basePath}/${randomImage()}`,
          postedBy: user._id,

          views: viewUsers, // biggest
          likes: likeUsers, // smaller
          comments, // smallest

          location: {
            type: "Point",
            coordinates: [12.9076, 77.6135],
          },
        });
      }
    });

    console.log(`Preparing ${posts.length} posts...`);

    // 🚀 single fast insert
    await Post.insertMany(posts);

    console.log("🎉 Posts created with views + likes + comments");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedPosts();
