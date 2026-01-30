const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    text: String,
    media: String,

    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    delivered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
