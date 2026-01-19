const express = require("express");
const router = express.Router();
const upload = require("../helpers/multer");

const {
  createPost,
  createNewPost,
  allposts,
  mypost,
  likepost,
  unlikepost,
  commentPost,
  deletePost,
  createStory,
  getPost,
} = require("../controllers/createPost");
const requiredLogin = require("../middleware/requiredLogin");

router.route("/createpost").post(requiredLogin, createPost);
router
  .route("/createNewPost")
  .post(requiredLogin, upload.single("photo"), createNewPost);
router.route("/allposts").get(requiredLogin, allposts);
router.route("/mypost").get(requiredLogin, mypost);
router.route("/:id").get(requiredLogin, getPost);
router.route("/like").put(requiredLogin, likepost);
router.route("/unlike").put(requiredLogin, unlikepost);
router.route("/comment").put(requiredLogin, commentPost);
router.route("/deletePost/:postId").delete(requiredLogin, deletePost);

module.exports = router;
