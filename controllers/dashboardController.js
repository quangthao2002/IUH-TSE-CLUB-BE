const User = require("../models/User"); // Model cho thành viên
const Team = require("../models/Team"); // Model cho đội nhóm
const Event = require("../models/Event"); // Model cho sự kiện
const Equipment = require("../models/Equipment");

const getCountDashboard = async (req, res) => {
  try {
    const users = await User.find().countDocuments();
    const teams = await Team.find().countDocuments();
    const events = await Event.find().countDocuments();
    const equipments = await Equipment.find().countDocuments();
    res.json({ users, teams, events, equipments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { getCountDashboard };
