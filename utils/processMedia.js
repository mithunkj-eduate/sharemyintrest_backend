const sharp = require("sharp");
// const path = require("path");
// const ffmpeg = require("fluent-ffmpeg");
// const ffmpegPath = require("ffmpeg-static");

// ffmpeg.setFfmpegPath(ffmpegPath);

const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
const Ffmpeg = require("fluent-ffmpeg");

// FIX 1: Set path and force execution permissions for Production
const binPath = ffmpegPath.path || ffmpegPath;
try {
  if (fs.existsSync(binPath)) {
    fs.chmodSync(binPath, 0o755);
  }
} catch (err) {
  console.error("Permission error on ffmpeg binary:", err);
}
Ffmpeg.setFfmpegPath(binPath);


const processVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const watermarkPath = path.join(__dirname, "../public/logo/watermark.png");

    Ffmpeg(inputPath)
      .input(watermarkPath)
      .videoCodec("libx264")
      .outputOptions([
        "-threads 1", // Force only ONE CPU core (Prevents server kill)
        "-preset ultrafast", // Do the least work possible
        "-crf 32", // High compression (Smaller file, lower CPU)
        "-maxrate 1M", // Limit data throughput
        "-bufsize 2M",
      ])
      .complexFilter([
        "[1:v]scale=20:-1[watermark]",
        "[0:v][watermark]overlay=W-w-20:H-h-150",
      ])
      .on("end", () => resolve(outputPath))
      .on("error", (err) => {
        console.error("FFmpeg Error details:", err.message);
        reject(err);
      })
      .save(outputPath);
  });
};

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

// const processVideo = (inputPath, outputPath) => {
//   return new Promise((resolve, reject) => {
//     const watermarkPath = path.join(__dirname, "../public/logo/watermark.png");

//     ffmpeg(inputPath)
//       .input(watermarkPath)
//       .setStartTime(0)
//       .setDuration(15)
//       .videoCodec("libx264")
//       .outputOptions(["-crf 28", "-preset veryfast"])
//       .complexFilter([
//         "[1:v]scale=20:-1[watermark]",
//         "[0:v][watermark]overlay=W-w-20:H-h-150",
//       ])
//       .on("end", () => resolve(outputPath))
//       .on("error", reject)
//       .save(outputPath);
//   });
// };

module.exports = {
  processImage,
  processVideo,
};
