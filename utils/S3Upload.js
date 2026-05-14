const {
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const { s3 } = require("../config/s3");

const bucketName = process.env.AWS_BUCKET_NAME;

const uploadToS3 = async (key, body, contentType) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `https://${bucketName}.s3.amazonaws.com/${key}`;
};

module.exports = { uploadToS3 };