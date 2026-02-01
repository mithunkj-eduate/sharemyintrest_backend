const Conversation = require("../model/conversationModel");
const Message = require("../model/messageModel");
const User = require("../model/userModel");
const expressAsyncHandler = require("express-async-handler");
const { encrypt, decrypt } = require("../utils/encrypt");
const { decryptMessage } = require("../utils/decryptMessage");
const path = require("path");
const fs = require("fs");

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

const getOrCreateConversationData = expressAsyncHandler(
  async (myId, friendId) => {
    let convo = await Conversation.findOne({
      participants: { $all: [myId, friendId] },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [myId, friendId],
      });
    }

    return convo;
  }
);

// POST /api/chat/conversation/:friendId
const getOrCreateConversation = expressAsyncHandler(async (req, res) => {
  const myId = req.user._id;
  const { friendId } = req.params;

  const convo = await getOrCreateConversationData(myId, friendId);

  // let convo = await Conversation.findOne({
  //   participants: { $all: [myId, friendId] },
  // });

  // if (!convo) {
  //   convo = await Conversation.create({
  //     participants: [myId, friendId],
  //   });
  // }

  res.json(convo);
});

// POST /api/chat/message
const sendMessage = expressAsyncHandler(async (req, res) => {
  const { conversationId, receiver, text, media, messageType } = req.body;
  console.log(messageType, "messageType");
  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    receiver,
    text: encrypt(text), // encrypted message save db
    messageType: messageType,
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
  const { page = 1 } = req.query;

  const limit = 20;

  const messages = await Message.find({
    conversation: req.params.conversationId,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

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

// POST /api/chat/uploadFile
const uploadFiles = expressAsyncHandler(async (req, res) => {
  const basePath = `/public`;
  const mediaUrl = `${basePath}/${req.file.filename}`;

  res.json({
    mediaUrl,
    name: req.file.originalname,
    size: req.file.size,
  });
});

const shareMessage = expressAsyncHandler(async (req, res) => {
  const { receivers, text, messageType } = req.body;

  const messages = await Promise.all(
    receivers.map(async (id) => {
      const conversation = await getOrCreateConversationData(req.user._id, id);

      return {
        conversation: conversation._id,
        sender: req.user._id,
        receiver: id,
        text: encrypt(text),
        messageType: messageType,
      };
    })
  );

  const saved = await Message.insertMany(messages);

  res.json(saved);
});

// GET
// download image
//  /api/chat/downloadFile/${messageId}
const downloadChatFile = expressAsyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error("not found messgae");
  }

  if (message.media) {
    //url image split get filename url http://localhost:8000/public/20200630_0601591714114545840.jpg
    const fileName = message.media.split("public/");

    //image path
    const imagePath = path.join(__dirname, `../public/${fileName[1]}`);

    // Read the image file
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.error("Error reading image file:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      // Send the image file as a response
      res.contentType("image/jpeg");
      res.send(data);
    });
  } else {
    res.status(404).send("File not found");
  }
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
  uploadFiles,
  shareMessage,
  downloadChatFile,
};
