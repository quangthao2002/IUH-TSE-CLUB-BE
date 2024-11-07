const User = require("../models/User");
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
        res.json({
          message: "Access token refreshed",
          data: newAccessToken,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { refreshAccessToken };
