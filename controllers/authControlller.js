const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1m" });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
//Khi token hết hạn, người dùng sẽ gọi API này để lấy access token mới.
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ message: "No refresh token provided" });

  try {
    const user = await User.findOne({ refreshToken });
    if (!user)
      return res.status(403).json({ message: "Refresh token not valid" });

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err)
          return res.status(403).json({ message: "Refresh token expired" });

        const newAccessToken = generateAccessToken(user._id); // Tạo access token mới
        const newRefreshToken = generateRefreshToken(user._id); // Tạo refresh token mới
        res.json({
          message: "Access token refreshed",
          data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { refreshAccessToken };
