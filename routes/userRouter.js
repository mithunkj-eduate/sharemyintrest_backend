const express = require("express");
const router = express.Router();
const upload = require("../helpers/multer");

const {
  getUser,
  follow,
  unfollow,
  followingpost,
  uploadProfilePic,
  followList,
  searchUser,
  getUsers,
  createStory,
  deleteStory,
} = require("../controllers/userController");
const requiredLogin = require("../middleware/requiredLogin");

router.route("/followingpost").get(requiredLogin, followingpost);
router.route("/followList").get(requiredLogin, followList);
router.route("/searchUser").get(requiredLogin, searchUser);
router.route("/getUsers").get(requiredLogin, getUsers);
router.route("/:id").get(requiredLogin, getUser);
router
  .route("/createStory")
  .put(requiredLogin, upload.single("photo"), createStory);
router.route("/deleteStory").put(requiredLogin, deleteStory);
// router.route("/uploadProfilePic").put(requiredLogin, uploadProfilePic);
router
  .route("/uploadProfilePic")
  .put(requiredLogin, upload.single("photo"), uploadProfilePic);

router.route("/follow").put(requiredLogin, follow);
router.route("/unfollow").put(requiredLogin, unfollow);

module.exports = router;
