const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userId: String,
  token: { type: String, unique: true, index: true },
});

module.exports = mongoose.model("Token", tokenSchema)