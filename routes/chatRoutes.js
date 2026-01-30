const express = require("express");
const router = express.Router();
const upload = require("../helpers/multer");

const {
  getConversations,
  getAllUsers,
  getOrCreateConversation,
  sendMessage,
  getMessages,
  markAsRead,
} = require("../controllers/chatController");
const requiredLogin = require("../middleware/requiredLogin");

router.route("/").get(requiredLogin, getConversations);
router.route("/users").get(requiredLogin, getAllUsers);

router
  .route("/conversation/:friendId")
  .post(requiredLogin, getOrCreateConversation);

router.route("/message").post(requiredLogin, sendMessage);

router.route("/messages/:conversationId").get(requiredLogin, getMessages);

router.route("/read/:conversationId").put(requiredLogin, markAsRead);

module.exports = router;
