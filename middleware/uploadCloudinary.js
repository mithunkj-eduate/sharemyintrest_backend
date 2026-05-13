const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.js");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "shareurinterest",
    resource_type: "auto",
  }),
});

const uploadCloudinary = multer({ storage });

module.exports = uploadCloudinary;
