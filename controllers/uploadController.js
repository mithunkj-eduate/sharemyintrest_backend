const Post = require("../model/post");
const expressAsyncHandler = require("express-async-handler");
const path = require("path");
const cloudinary = require("../config/cloudinary.js");
const axios = require("axios");
const { uploadToS3 } = require("../utils/S3Upload.js");
const Story = require("../model/storyModel.js");

const uploadMedia = expressAsyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const publicId = req.file.filename;
    const resourceType = req.file.mimetype.startsWith("video")
      ? "video"
      : "image";

    // transformed cloudinary URL
    const transformedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      fetch_format: "auto",
      quality: "auto",
      transformation: [
        {
          overlay: "watermark",
          width: 40,
          crop: "scale",
          gravity: "south_east",
          opacity: 70,
          x: 10,
          y: 10,
        },
      ],
    });

    // download transformed asset
    const response = await axios.get(transformedUrl, {
      responseType: "arraybuffer",
    });

    const fileBuffer = response.data;

    const extension = path.extname(req.file.originalname);
    // const fileName = `uploads/${Date.now()}-${publicId}${extension}`;
    const cleanPublicId = publicId.replace("/", "-");

    const fileName =
      resourceType === "video"
        ? `snap_shareurinterest/reels/${req.user?._id}/videos/${Date.now()}-${cleanPublicId}${extension}`
        : `snap_shareurinterest/posts/${req.user?._id}/images/${Date.now()}-${cleanPublicId}${extension}`;

    // upload s3
    const url = await uploadToS3(fileName, fileBuffer, resourceType);

    // delete cloudinary original
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    const post = new Post({
      body: req.body.title,
      photo: fileName, // S3 URL
      mediaType: resourceType,
      postedBy: req.user,
      location: {
        type: "Point",
        coordinates: [12.907637572103615, 77.61350705305202],
      },
    });

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Uploaded successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const uploadStoreMedia = expressAsyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const publicId = req.file.filename;
    const resourceType = req.file.mimetype.startsWith("video")
      ? "video"
      : "image";

    // transformed cloudinary URL
    const transformedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      fetch_format: "auto",
      quality: "auto",
      transformation: [
        {
          overlay: "watermark",
          width: 40,
          crop: "scale",
          gravity: "south_east",
          opacity: 70,
          x: 10,
          y: 10,
        },
      ],
    });

    // download transformed asset
    const response = await axios.get(transformedUrl, {
      responseType: "arraybuffer",
    });

    const fileBuffer = response.data;

    const extension = path.extname(req.file.originalname);
    // const fileName = `uploads/${Date.now()}-${publicId}${extension}`;
    const cleanPublicId = publicId.replace("/", "-");

    const fileName =
      resourceType === "video"
        ? `snap_shareurinterest/stories/${req.user?._id}/videos/${Date.now()}-${cleanPublicId}${extension}`
        : `snap_shareurinterest/stories/${req.user?._id}/images/${Date.now()}-${cleanPublicId}${extension}`;

    // upload s3
    const url = await uploadToS3(fileName, fileBuffer, resourceType);

    // delete cloudinary original
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    const expirationTime = new Date(Date.now() + 60 * 60 * 24 * 1000); // 1 hour from now 60 * 60 * 1000

    const post = new Story({
      body: req.body.title,
      photo: fileName ?? "",
      postedBy: req.user,
      expirationTime: expirationTime,
    });

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Uploaded successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const uploadChatMedia = expressAsyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const publicId = req.file.filename;
    const resourceType = req.file.mimetype.startsWith("video")
      ? "video"
      : "image";

    // transformed cloudinary URL
    const transformedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      fetch_format: "auto",
      quality: "auto",
      transformation: [
        {
          overlay: "watermark",
          width: 40,
          crop: "scale",
          gravity: "south_east",
          opacity: 70,
          x: 10,
          y: 10,
        },
      ],
    });

    // download transformed asset
    const response = await axios.get(transformedUrl, {
      responseType: "arraybuffer",
    });

    const fileBuffer = response.data;

    const extension = path.extname(req.file.originalname);
    // const fileName = `uploads/${Date.now()}-${publicId}${extension}`;
    const cleanPublicId = publicId.replace("/", "-");

    const fileName =
      resourceType === "video"
        ? `snap_shareurinterest/messages/${req.user?._id}/videos/${Date.now()}-${cleanPublicId}${extension}`
        : `snap_shareurinterest/messages/${req.user?._id}/images/${Date.now()}-${cleanPublicId}${extension}`;

    // upload s3
    const url = await uploadToS3(fileName, fileBuffer, resourceType);

    // delete cloudinary original
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    const reqUrl = url.split(
      "https://snap.shareurinterest.com.s3.ap-south-1.amazonaws.com/",
    );
    // const url = `https://s3.ap-south-1.amazonaws.com/${bucketName}${reqUrl[1]}`;
    const url1 = `${reqUrl[1]}`;

    return res.status(200).json({
      success: true,
      message: "Uploaded successfully",
      mediaUrl: url1,
      name: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  uploadMedia,
  uploadStoreMedia,
  uploadChatMedia,
};
