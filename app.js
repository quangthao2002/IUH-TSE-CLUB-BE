const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const connectDB = require("./configs/db.js");
const authRouters = require("./routes/authRouter.js");
const userRouters = require("./routes/userRouter.js");
const teamRouters = require("./routes/teamRouter.js");
const teamMemberRouters = require("./routes/teamMemberRouter.js");
const competitionRoutes = require("./routes/competitionRouter.js");
const eventRoutes = require("./routes/eventRoutes.js");
const equipmentRoutes = require("./routes/equipmentRoutes.js");
const cors = require("cors");
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();

connectDB();

app.use(express.json()); //
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouters);
app.use("/api/user", userRouters);
app.use("/api/team", teamRouters);
app.use("/api/team-member", teamMemberRouters);
app.use("/api/competitions", competitionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/equipment", equipmentRoutes);

// Route mặc định
app.get("/", (req, res) => {
  res.send("IUH TSE Club API is running");
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
