const express = require("express");
const router = express.Router();

const { register, login ,googleLogin} = require("../controllers/authController");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/googleLogin").post(googleLogin);


module.exports = router;
