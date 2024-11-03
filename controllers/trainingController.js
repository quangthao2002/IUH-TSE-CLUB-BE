const TrainingSession = require("../models/TrainingSession");

// Đăng ký làm người đào tạo cho khóa sau
const registerAsTrainer = async (req, res) => {
  const userId = req.user.id; // userId lấy từ token đã xác thực
  const { trainingSessionId } = req.params;

  try {
    const session = await TrainingSession.findById(trainingSessionId);
    if (!session) {
      return res.status(404).json({ message: "Training session not found" });
    }
    if (session.trainer) {
      return res.status(400).json({ message: "Trainer already assigned" });
    }

    session.trainer = userId;
    await session.save();
    res.json({ message: "Registered as trainer", session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { registerAsTrainer };
