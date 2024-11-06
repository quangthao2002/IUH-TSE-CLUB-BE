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
dotenv.config();

// Kết nối với MongoDB
connectDB();

const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;

// Đặt Client ID và Client Secret của GitHub từ ứng dụng đã đăng ký
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_SECRET, // Thay thế bằng GitHub Client ID
      clientSecret: process.env.GITHUB_CLIENT_SECRET, // Thay thế bằng GitHub Client Secret
      callbackURL: "http://localhost:5000/auth/github/callback", // Địa chỉ callback URL
    },
    (accessToken, refreshToken, profile, done) => {
      // Hàm callback sau khi đăng nhập thành công
      // Tại đây, bạn có thể lưu thông tin người dùng vào database nếu cần
      // done(null, profile) tiếp tục quy trình xác thực và gửi dữ liệu profile
      return done(null, profile);
    }
  )
);

// Serialize và Deserialize để quản lý phiên làm việc
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
const app = express();
// Cấu hình session cho Express
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret", // Chuỗi bí mật cho session
    resave: false,
    saveUninitialized: true,
  })
);
app.get("/auth/github", passport.authenticate("github"));

// Route để xử lý callback từ GitHub sau khi xác thực
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }), // Chuyển hướng nếu xác thực thất bại
  (req, res) => {
    // Đăng nhập thành công, chuyển hướng về trang chính
    res.redirect("/");
  }
);

app.use(express.json()); //

app.use("/api/auth", authRouters);
app.use("/api/user", userRouters);
app.use("/api/team", teamRouters);
app.use("/api/team-member", teamMemberRouters);
app.use("/api/competitions", competitionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/equipment", equipmentRoutes);

app.get("/", (req, res) => {
  res.send("IUH TSE Club API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
