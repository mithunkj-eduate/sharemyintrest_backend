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
  createNewPostS3,
} = require("../controllers/createPost");
const requiredLogin = require("../middleware/requiredLogin");
const { uploadToS3 } = require("../helpers/multerS3");

router.route("/createpost").post(requiredLogin, createPost);
// upload image local backend
// router
//   .route("/createNewPost")
//   .post(requiredLogin, upload.single("photo"), createNewPost);

//upload image s3
router
  .route("/createNewPost")
  .post(requiredLogin, uploadToS3.single("photo"), createNewPostS3);
router.route("/allposts").get(requiredLogin, allposts);
router.route("/mypost").get(requiredLogin, mypost);
router.route("/:id").get(requiredLogin, getPost);
router.route("/like").put(requiredLogin, likepost);
router.route("/unlike").put(requiredLogin, unlikepost);
router.route("/comment").put(requiredLogin, commentPost);
router.route("/deletePost/:postId").delete(requiredLogin, deletePost);

module.exports = router;
