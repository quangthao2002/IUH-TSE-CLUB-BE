const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../configs/aws-config");
const dotenv = require("dotenv");
dotenv.config();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, // Đặt loại nội dung tự động
    key: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${file.originalname}`;
      cb(null, `plans/${uniqueSuffix}`); // Đường dẫn trong bucket
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});

module.exports = upload;
