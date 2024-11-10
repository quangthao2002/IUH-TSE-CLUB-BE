const Competition = require("../models/Competition");

// API cho Admin tạo cuộc thi
const createCompetition = async (req, res) => {
  const { competitionName, competitionDate } = req.body;

  try {
    const newCompetition = new Competition({
      competitionName,
      competitionDate,
    });

    await newCompetition.save();

    res.status(201).json({
      message: "Competition created successfully",
      data: { newCompetition },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// lấy danh sách cuộc thi
const getAllCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find();
    res.json({ message: "Competitions found", data: { competitions } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCompetition,
  getAllCompetitions,
};
