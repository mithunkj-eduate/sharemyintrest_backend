const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const messageSchema = new mongoose.Schema(
  {
    body: { type: String },
    photo: { type: String },
    link: { type: String },
    likes: [{ type: ObjectId, ref: "User" }],
    comments: [
      {
        comment: { type: String },
        postedBy: { type: ObjectId, ref: "User" },
        date: { type: Date, default: Date.now() },
      },
    ],
    postedBy: { type: ObjectId, ref: "User" },
    receivedBy: { type: ObjectId, ref: "User" },
    status: { type: Boolean,default:false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
