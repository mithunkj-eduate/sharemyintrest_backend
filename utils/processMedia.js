const sharp = require("sharp");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);


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
    const watermarkPath = path.join(__dirname, "../public/logo/watermark.png");

    ffmpeg(inputPath)
      .input(watermarkPath)
      .setStartTime(0)
      .setDuration(15)
      .videoCodec("libx264")
      .outputOptions(["-crf 28", "-preset veryfast"])
      .complexFilter([
        "[1:v]scale=20:-1[watermark]",
        "[0:v][watermark]overlay=W-w-20:H-h-150",
      ])
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .save(outputPath);
  });
};

module.exports = {
  processImage,
  processVideo,
};
