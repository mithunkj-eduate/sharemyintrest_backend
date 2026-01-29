const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;



const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const postSchema = new mongoose.Schema(
  {
    body: { type: String },
    photo: { type: String, required: true },
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
    location: {
      type: pointSchema,
      required: true,
    },
    // expirationTime: { type: Date },
  },
  { timestamps: true }
);

// postSchema.pre("deleteOne", { document: true }, async function (next) {
//   const postId = this._id;

//   // remove post from all users likedPosts
//   await mongoose.model("User").updateMany(
//     { likedPosts: postId },
//     { $pull: { likedPosts: postId } }
//   );

//   next();
// });


//create 2dsphere indexing
postSchema.index({ location: "2dsphere" });

postSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Post", postSchema);
