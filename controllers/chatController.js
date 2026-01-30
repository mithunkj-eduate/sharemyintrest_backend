const Conversation = require("../model/conversationModel");
const Message = require("../model/messageModel");
const User = require("../model/userModel");
const expressAsyncHandler = require("express-async-handler");

// GET /api/chat
const getConversations = expressAsyncHandler(async (req, res) => {
  const myId = req.user;

  const conversations = await Conversation.find({
    participants: myId,
  })
    .populate("participants", "userName Photo")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  res.json(conversations);
});

// POST /api/chat/conversation/:friendId
const getOrCreateConversation = expressAsyncHandler(async (req, res) => {
  const myId = req.user;
  const { friendId } = req.params;

  let convo = await Conversation.findOne({
    participants: { $all: [myId, friendId] },
  });

  if (!convo) {
    convo = await Conversation.create({
      participants: [myId, friendId],
    });
  }

  res.json(convo);
});

// POST /api/chat/message
const sendMessage = expressAsyncHandler(async (req, res) => {
  const { conversationId, receiver, text, media } = req.body;

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user,
    receiver,
    text,
    media,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
  });

  res.json(message);
});

// GET /api/chat/messages/:conversationId
const getMessages = async (req, res) => {
  const { page = 0 } = req.query;

  const limit = 20;

  const messages = await Message.find({
    conversation: req.params.conversationId,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(page * limit);

  res.json(messages.reverse());
};

// PUT /api/chat/read/:conversationId
const markAsRead = expressAsyncHandler(async (req, res) => {
  await Message.updateMany(
    {
      conversation: req.params.conversationId,
      receiver: req.user,
      isRead: false,
    },
    { isRead: true }
  );

  res.json({ success: true });
});

// GET /api/chat/users
const getAllUsers = expressAsyncHandler(async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.user },
  }).select("userName Photo");

  res.json(users);
});

module.exports = {
  getConversations,
  getOrCreateConversation,
  sendMessage,
  getMessages,
  markAsRead,
  getAllUsers,
};
