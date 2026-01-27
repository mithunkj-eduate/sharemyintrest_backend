const express = require("express");
const router = express.Router();

router.get("/check", (req, res) => {
  res.json({ status: "Test Check OK" });
});

module.exports = router;
