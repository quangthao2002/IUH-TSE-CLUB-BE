const Team = require("../models/Team");
// tao nhom phia admin
const createTeam = async (req, res) => {
  const { teamName, description, teamLeader } = req.body; // teamLeader sẽ được chọn từ UI
  const createdBy = req.user.id;

  try {
    const newTeam = new Team({
      teamName,
      description,
      teamLeader,
      members: [teamLeader], // Leader sẽ là thành viên đầu tiên của nhóm
      createdBy,
      status: "open",
    });

    await newTeam.save();
    res
      .status(201)
      .json({ message: "Team created successfully", team: newTeam });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// thanh vien yeu cau tham gia nhom

const requestJoinTeam = async (req, res) => {
  const userId = req.user.id;
  const { teamId } = req.params;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.joinRequests.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already requested to join this team" });
    }

    team.joinRequests.push(userId);
    await team.save();

    res.json({ message: "Join request sent successfully", team });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// admin xac nhan tham gia nhom

const handleJoinRequest = async (req, res) => {
  const { teamId, userId } = req.params;
  const { action } = req.body; // accept hoặc reject

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const requestIndex = team.joinRequests.indexOf(userId);
    if (requestIndex === -1) {
      return res.status(404).json({ message: "Join request not found" });
    }

    if (action === "accept") {
      team.members.push(userId);
      team.joinRequests.splice(requestIndex, 1); // Xóa yêu cầu
      await team.save();
      res.json({ message: "User added to the team", team });
    } else if (action === "reject") {
      team.joinRequests.splice(requestIndex, 1);
      await team.save();
      res.json({ message: "Join request rejected", team });
    } else {
      res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Khi Admin hoặc Leader cần lấy danh sách các yêu cầu tham gia của nhóm:

const getJoinRequests = async (req, res) => {
  const { teamId } = req.params;

  try {
    const team = await Team.findById(teamId).populate(
      "joinRequests",
      "name email"
    );
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({
      message: "Join requests retrieved successfully",
      requests: team.joinRequests, // Danh sách yêu cầu tham gia
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email"); // Chỉ lấy thông tin cần thiết
    res.json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  createTeam,
  requestJoinTeam,
  handleJoinRequest,
  getJoinRequests,
  getAllUsers,
};
