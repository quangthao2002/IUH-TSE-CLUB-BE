const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");

const generateAccessToken = (userId, roleUser) => {
  return jwt.sign({ id: userId, role: roleUser }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const generateRefreshToken = async (userId) => {
  const token = jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d", // Refresh token hết hạn sau 7 ngày
  });

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  // Lưu vào cơ sở dữ liệu
  await RefreshToken.create({
    token,
    user: userId,
    expiryDate,
  });

  return token;
};
//Khi token hết hạn, người dùng sẽ gọi API này để lấy access token mới.
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token provided" });
  }

  try {
    const tokenData = await RefreshToken.findOne({
      token: refreshToken,
    }).populate("user", "role");

    if (!tokenData) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Kiểm tra token có hết hạn không
    if (tokenData.expiryDate < new Date()) {
      await RefreshToken.deleteOne({ token: refreshToken }); // Xóa token hết hạn
      return res.status(403).json({ message: "Refresh token expired" });
    }

    // Tạo access token mới
    const newAccessToken = jwt.sign(
      { id: tokenData.user.id, role: tokenData.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Tùy chọn: Tạo refresh token mới (nếu cần) và xóa token cũ
    const newRefreshToken = await generateRefreshToken(tokenData.user);
    await RefreshToken.deleteOne({ token: refreshToken });

    res.json({
      message: "Access token refreshed",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }, // Token còn hạn
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    console.log(user);
    // Cập nhật trạng thái người dùng thành đã xác thực
    user.isVerify = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.json({
      data: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", data: false });
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  verifyEmail,
};
