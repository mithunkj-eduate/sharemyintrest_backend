const express = require("express");
const router = express.Router();

const {
  register,
  login,
  googleLogin,
  registerBulk,
  getAccessToken,
  sharemyinterestLogin,
} = require("../controllers/authController");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/googleLogin").post(googleLogin);
router.route("/bulkRegister").post(registerBulk);
router.route("/token").get(getAccessToken);
router.route("/laginWithShareMyInterest").post(sharemyinterestLogin);

module.exports = router;
