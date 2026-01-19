const multer = require("multer");

//find mime type
const FILE_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },

  filename: function (req, file, cb) {
    const ext = FILE_TYPE[file.mimetype];
    const uniqueSuffix = Date.now();
    const filename = file.originalname;
    const newName = filename.split(".");
    if (ext == undefined) {
      cb(new Error("Wrong file type uploaded"));
    }
    cb(null, newName[0] + uniqueSuffix + "." + newName[1]);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
