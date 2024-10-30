const Achievement = require("../models/Achievement");
const createAchievement = async (req, res) => {
  const { competitionId, teamId, result } = req.body;

  try {
    const achievement = new Achievement({
      competition: competitionId,
      team: teamId,
      result,
    });

    await achievement.save();

    res.status(201).json({ message: "Achievement created", achievement });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createAchievement,
};
