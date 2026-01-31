const Conversation = require("../model/conversationModel");
const Message = require("../model/messageModel");
const User = require("../model/userModel");
const expressAsyncHandler = require("express-async-handler");
const { encrypt, decrypt } = require("../utils/encrypt");
const { decryptMessage } = require("../utils/decryptMessage");

// GET /api/chat
const getConversations = expressAsyncHandler(async (req, res) => {
  const myId = req.user._id;

  const conversations = await Conversation.find({
    participants: myId,
  })
    .populate("participants", "userName Photo")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  const result = conversations.map((c) => ({
    ...c.toObject(),
    lastMessage: decryptMessage(c.lastMessage),
  }));

  res.json(result);
});

// POST /api/chat/conversation/:friendId
const getOrCreateConversation = expressAsyncHandler(async (req, res) => {
  const myId = req.user._id;
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
    sender: req.user._id,
    receiver,
    text: encrypt(text), // encrypted message save db
    media,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
  });

  message.text = decrypt(message.text); // decrypt message send to frontend

  res.json(message);
});

// GET /api/chat/messages/:conversationId
const getMessages = expressAsyncHandler(async (req, res) => {
  const { page = 0 } = req.query;

  const limit = 20;

  const messages = await Message.find({
    conversation: req.params.conversationId,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(page * limit);

  const decrypted = messages.map((m) => ({
    ...m.toObject(),
    text: m.text ? decrypt(m.text) : "",
  }));

  res.json(decrypted.reverse());
});

// PUT /api/chat/read/:conversationId
const markAsRead = expressAsyncHandler(async (req, res) => {
  await Message.updateMany(
    {
      conversation: req.params.conversationId,
      receiver: req.user._id,
      isRead: false,
    },
    { isRead: true }
  );

  res.json({ success: true });
});

// GET /api/chat/users
const getAllUsers = expressAsyncHandler(async (req, res) => {
  const users = await User.find({
    _id: { $ne: req.user._id },
  }).select("userName Photo");

  res.json(users);
});

// POST /api/chat/group
const createGroup = expressAsyncHandler(async (req, res) => {
  const convo = await Conversation.create({
    participants: req.body.users,
    isGroup: true,
    groupName: req.body.name,
    admin: req.user_id,
  });

  res.json(convo);
});

// DELETE /api/chat/message/:id
const deleteMessage = expressAsyncHandler(async (req, res) => {
  await Message.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
  });

  res.json({ success: true });
});

module.exports = {
  getConversations,
  getOrCreateConversation,
  sendMessage,
  getMessages,
  markAsRead,
  getAllUsers,
  createGroup,
  deleteMessage,
};
