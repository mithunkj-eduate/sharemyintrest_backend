const express = require("express");
const router = express.Router();
const upload = require("../helpers/multer");

const {
  createMessage,
  getMessages,
  downloadFile,
  createMessageS3,
} = require("../controllers/messageController");
const requiredLogin = require("../middleware/requiredLogin");
const { uploadToS3 } = require("../helpers/multerS3");

//upload local
// router
//   .route("/message")
//   .post(requiredLogin, upload.single("photo"), createMessage);

//upload s3
router
  .route("/message")
  .post(requiredLogin, uploadToS3.single("photo"), createMessageS3);

router.route("/message?").get(requiredLogin, getMessages);
router.route("/downloadFile/:id").get(downloadFile);

module.exports = router;
