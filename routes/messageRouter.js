const express = require("express");
const router = express.Router();
const upload = require("../helpers/multer");

const {
  createMessage,
  getMessages,
  downloadFile
} = require("../controllers/messageController");
const requiredLogin = require("../middleware/requiredLogin");

router
  .route("/message")
  .post(requiredLogin, upload.single("photo"), createMessage);
router.route("/message?").get(requiredLogin, getMessages);
router.route("/downloadFile/:id").get(downloadFile)

module.exports = router;
