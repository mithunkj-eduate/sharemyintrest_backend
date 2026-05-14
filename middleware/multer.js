const multer = require("multer");

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "video/mp4",
  "video/quicktime",
  "video/mpeg",
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = upload;