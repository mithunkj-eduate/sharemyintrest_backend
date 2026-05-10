const sharp = require("sharp");
// // const ffmpeg = require("fluent-ffmpeg");
// const ffmpegPath = require("ffmpeg-static");
// const fs = require("fs");
// const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

console.log("FFmpeg path:", ffmpeg._getFfmpegPath);
ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

// ffmpeg.setFfmpegPath(ffmpegPath);

const processImage = async (fileBuffer) => {
  const svgWatermark = `
    <svg width="500" height="100">
      <text x="50%" y="50%"
        font-size="40"
        fill="white"
        opacity="0.5"
        text-anchor="middle"
        dominant-baseline="middle">
        ShareUrInterest
      </text>
    </svg>
  `;

  return await sharp(fileBuffer)
    .resize({ width: 1280 })
    .jpeg({ quality: 70 })
    .composite([
      {
        input: Buffer.from(svgWatermark),
        gravity: "southeast",
      },
    ])
    .toBuffer();
};

const processVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {

    ffmpeg(inputPath)
      .setStartTime(0)
      .setDuration(15)
      .videoCodec("libx264")
      .outputOptions(["-crf 28", "-preset veryfast"])
      .videoFilters(
        "drawtext=text='ShareUrInterest':x=w-tw-20:y=h-th-20:fontsize=30:fontcolor=white@0.5",
      )
      .save(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject);
  });
};

module.exports = {
  processImage,
  processVideo,
};
