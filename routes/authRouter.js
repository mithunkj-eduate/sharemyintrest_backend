const express = require("express");
const router = express.Router();

const {
  register,
  login,
  googleLogin,
  registerBulk,
} = require("../controllers/authController");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/googleLogin").post(googleLogin);
router.route("/bulkRegister").post(registerBulk);

module.exports = router;
