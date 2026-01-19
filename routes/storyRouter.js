const express = require("express");
const router = express.Router();
const upload = require("../helpers/multer");

const {
  createNewStory,
  allStories,
  getStory,
  storyViewerslist,
  downloadStory,
} = require("../controllers/storyController");
const requiredLogin = require("../middleware/requiredLogin");

router
  .route("/createStory")
  .post(requiredLogin, upload.single("photo"), createNewStory);
router.route("/allStories").get(requiredLogin, allStories);
router.route("/story?").get(requiredLogin, getStory);
router.route("/storyViewerslist/:id").get(requiredLogin, storyViewerslist);

module.exports = router;
