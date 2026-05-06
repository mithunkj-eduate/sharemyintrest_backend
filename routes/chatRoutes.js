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
  createGroup,
  deleteMessage,
  uploadFiles,
  shareMessage,
  downloadChatFile,
  uploadFilesS3,
} = require("../controllers/chatController");
const { uploadToS3 } = require("../helpers/multerS3");


const messageUpload = uploadToS3("messages");

const requiredLogin = require("../middleware/requiredLogin");

router.route("/").get(requiredLogin, getConversations);
router.route("/users").get(requiredLogin, getAllUsers);

router
  .route("/conversation/:friendId")
  .post(requiredLogin, getOrCreateConversation);

router.route("/message").post(requiredLogin, sendMessage);

router.route("/messages/:conversationId").get(requiredLogin, getMessages);

router.route("/read/:conversationId").put(requiredLogin, markAsRead);

router.route("/group").post(requiredLogin, createGroup);
router.route("/share").post(requiredLogin, shareMessage);

router.route("/message/:id").delete(requiredLogin, deleteMessage);
// router
//   .route("/uploads")
//   .post(requiredLogin, upload.single("file"), uploadFiles); // local store images
router
  .route("/uploads")
  .post(requiredLogin, messageUpload.single("file"), uploadFilesS3); // s3 store images
router.route("/downloadFile/:id").get(requiredLogin, downloadChatFile);

module.exports = router;
