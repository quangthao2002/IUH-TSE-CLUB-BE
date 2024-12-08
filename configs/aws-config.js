const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();

// Cấu hình AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Lấy từ môi trường
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Lấy từ môi trường
  region: process.env.AWS_REGION, // Vùng của bucket
});

const s3 = new AWS.S3();
module.exports = s3;
