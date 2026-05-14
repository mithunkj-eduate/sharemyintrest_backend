const express = require("express");
const router = express.Router();
// const upload = require("../helpers/multer");
const upload = require("../middleware/multer");

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

const uploadCloudinary = require("../middleware/uploadCloudinary");
const { uploadMedia } = require("../controllers/uploadController");

// const { uploadToS3 } = require("../helpers/multerS3");

// const postUpload = uploadToS3("posts");

router.route("/createpost").post(requiredLogin, createPost);
// upload image local backend
// router
//   .route("/createNewPost")
//   .post(requiredLogin, upload.single("photo"), createNewPost);

//upload image s3
// router
//   .route("/createNewPost")
//   .post(requiredLogin, postUpload.single("photo"), createNewPostS3);

// router.post(
//   "/createNewPost",
//   requiredLogin,
//   upload.single("photo"),
//   createNewPostS3,
// );
router.route("/allposts").get(requiredLogin, allposts);
router.route("/mypost").get(requiredLogin, mypost);
router.route("/:id").get(requiredLogin, getPost);
router.route("/like").put(requiredLogin, likepost);
router.route("/unlike").put(requiredLogin, unlikepost);
router.route("/comment").put(requiredLogin, commentPost);
router.route("/deletePost/:postId").delete(requiredLogin, deletePost);

//upload image or videos cloudinary
router.post("/createNewPost",requiredLogin, uploadCloudinary.single("photo"), uploadMedia);


module.exports = router;
