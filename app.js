const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./configs/db.js");
const auth = require("./Routes/auth.js");

// Load biến môi trường từ file .env
dotenv.config();

// Kết nối với MongoDB
connectDB();

const app = express();
app.use(express.json()); // Để xử lý dữ liệu JSON

app.use("/api/auth", auth);
// Ví dụ route đơn giản
app.get("/", (req, res) => {
  res.send("IUH TSE Club API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
