const express = require("express");
const router = express.Router();
// const upload = require("../helpers/multer");

const {
  createNewStory,
  allStories,
  getStory,
  storyViewerslist,
  downloadStory,
  createNewStoryS3,
} = require("../controllers/storyController");
const requiredLogin = require("../middleware/requiredLogin");
const { uploadToS3 } = require("../helpers/multerS3");
const upload = require("../middleware/multer");
const { uploadStoreMedia } = require("../controllers/uploadController");
const uploadCloudinary = require("../middleware/uploadCloudinary");

// const storiesUpload = uploadToS3("stories");

// router
//   .route("/createStory")
//   .post(requiredLogin, upload.single("photo"), createNewStory); // store local
// router
//   .route("/createStory")
//   .post(requiredLogin, storiesUpload.single("photo"), createNewStoryS3); // store S3

// router.post(
//   "/createStory",
//   requiredLogin,
//   upload.single("photo"),
//   createNewStoryS3,
// );

router.post(
  "/createStory",
  requiredLogin,
  uploadCloudinary.single("photo"),
  uploadStoreMedia,
);
router.route("/allStories").get(requiredLogin, allStories);
router.route("/story?").get(requiredLogin, getStory);
router.route("/storyViewerslist/:id").get(requiredLogin, storyViewerslist);

module.exports = router;
