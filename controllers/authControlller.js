const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
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
    const tokenData = await RefreshToken.findOne({ token: refreshToken });

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
      { id: tokenData.user },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
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

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
};
