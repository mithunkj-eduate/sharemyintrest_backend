import 'dotenv/config'; // Loads .env variables immediately
import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "./s3.js";

const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",

  // Videos
  "video/mp4",
  "video/mpeg",
  "video/quicktime", // .mov
  "video/x-matroska", // .mkv
];

const bucketName = process.env.AWS_BUCKET_NAME ?? "";

export const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // acl: "public-read", // ⚠️ remove if using private bucket

    key: function (req, file, cb) {
      const type = file.mimetype.startsWith("video") ? "videos" : "images";
      const fileName = `snap_shareurinterest/posts/${req.user?._id}/${type}/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),

  // ✅ File filter (important)
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"), false);
    }
  },

  // ✅ Size limits (VERY important for videos)
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB (adjust as needed)
  },
});
