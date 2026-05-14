const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const storySchema = new mongoose.Schema(
  {
    body: { type: String },
    photo: { type: String, required: false },
    likes: [{ type: ObjectId, ref: "User" }],
    comments: [
      {
        comment: { type: String },
        postedBy: { type: ObjectId, ref: "User" },
        date: { type: Date, default: Date.now() },
      },
    ],
    postedBy: { type: ObjectId, ref: "User" },
    views: [{ type: ObjectId, ref: "User" }],
    expirationTime: { type: Date },
  },
  { timestamps: true },
);

// Create TTL index on the expirationTime field
storySchema.index({ expirationTime: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Story", storySchema);
