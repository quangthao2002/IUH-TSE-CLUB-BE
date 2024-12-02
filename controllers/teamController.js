const Team = require("../models/Team");
const User = require("../models/User");

const getAllTeams = async (req, res) => {
  const { q, status, page = 1, limit = 10 } = req.query;

  try {
    const query = {};
    if (q) query.teamName = { $regex: q, $options: "i" }; // Tìm kiếm theo tên
    if (status) query.status = status; // Lọc theo trạng thái

    const skip = (page - 1) * limit;
    const totalTeams = await Team.countDocuments(query);
    const teams = await Team.find(query)
      .populate("teamLeader", "name email")
      .populate("members")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      message: "Teams fetched successfully",
      data: {
        total: totalTeams,
        teams,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTeams / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

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

    // Cập nhật role của user thành "teamLeader"
    await User.findByIdAndUpdate(teamLeader, { role: "teamLeader" });
    res
      .status(201)
      .json({ message: "Team created successfully", team: newTeam });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getOpenTeams = async (req, res) => {
  try {
    const teams = await Team.find({ status: "open" }).populate(
      "teamLeader",
      "name"
    );

    res.json({ message: "Open teams retrieved successfully", teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// thanh vien yeu cau tham gia nhom

const requestJoinTeam = async (req, res) => {
  const userId = req.user.id; // Lấy userId từ token
  const { teamId } = req.params;

  try {
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Kiểm tra nếu user đã là thành viên hoặc đã gửi yêu cầu tham gia
    if (team.members.includes(userId) || team.joinRequests.includes(userId)) {
      return res.status(400).json({
        message: "You have already joined or requested to join this team",
      });
    }

    // Thêm user vào danh sách joinRequests
    team.joinRequests.push(userId);
    await team.save();

    res.status(200).json({ message: "Request to join team sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteTeam = async (req, res) => {
  const { teamId } = req.params;

  try {
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Xóa nhóm
    await Team.findByIdAndDelete(teamId);

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error(error);
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

const changeTeamLeader = async (req, res) => {
  const { teamId } = req.params;
  const { newLeaderId } = req.body; // ID của leader mới

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const currentLeaderId = team.teamLeader;

    // Cập nhật leader của nhóm
    team.teamLeader = newLeaderId;

    // Cập nhật leader hiện tại thành "member"
    await User.findByIdAndUpdate(currentLeaderId, { role: "member" });

    // Cập nhật role của leader mới thành "teamLeader"
    await User.findByIdAndUpdate(newLeaderId, { role: "teamLeader" });

    await team.save();

    res.json({ message: "Team leader changed successfully", team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getAllTeams,
  createTeam,
  requestJoinTeam,
  deleteTeam,
  handleJoinRequest,
  getJoinRequests,
  getAllUsers,
  changeTeamLeader,
  getOpenTeams,
};
