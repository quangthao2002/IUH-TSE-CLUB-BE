const Team = require("../models/Team");
const TeamMember = require("../models/TeamMember");
const Achievement = require("../models/Achievement");

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
      .populate("members", "name email")
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

// API cho Admin tạo đội
const createTeam = async (req, res) => {
  const { teamName, teamLeader, members, description, achievements } = req.body;
  const createdBy = req.user.id; // Người tạo từ token

  try {
    const newTeam = new Team({
      teamName,
      teamLeader,
      members,
      description,
      achievements,
      createdBy,
    });

    await newTeam.save();
    res
      .status(201)
      .json({ message: "Team created successfully", team: newTeam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("teamLeader", "name email")
      .populate("members", "name email")
      .populate("projects");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({ message: "Team details fetched successfully", team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// đăng ký đội tuyển ở phía member
const registerTeam = async (req, res) => {
  const { teamId } = req.body; // Team mà người dùng muốn tham gia
  const memberId = req.user._id; // ID của người dùng hiện tại

  try {
    // Kiểm tra xem team có tồn tại không
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Tạo yêu cầu tham gia team
    const newTeamMember = new TeamMember({
      memberId: memberId,
      teamId: teamId,
      status: "pending", // Đợi duyệt
    });

    await newTeamMember.save();

    res.status(200).json({
      message: "Registration request sent, waiting for approval",
      data: { newTeamMember },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// cập nhật kết quả đội  tuyển
const updateTeamResults = async (req, res) => {
  const { teamId } = req.params;
  const { competitionId, result } = req.body;

  try {
    // Tạo kết quả mới
    const achievement = new Achievement({
      competition: competitionId,
      team: teamId,
      result: result,
    });

    await achievement.save();

    res
      .status(200)
      .json({ message: "Team results updated", data: { achievement } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Lọc đội theo thành tích
const filterTeamsByAchievement = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const achievements = await Achievement.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).populate("team competition");

    const teamsWithAchievements = achievements.map((achievement) => ({
      team: achievement.team.teamName,
      competition: achievement.competition.competitionName,
      result: achievement.result,
    }));

    res
      .status(200)
      .json({ message: "Teams found", data: { teamsWithAchievements } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const assignTeamMemberRole = async (req, res) => {
  const { teamId, memberId } = req.params; // teamId và memberId
  const { role } = req.body; // Vai trò mới (teamLeader hoặc member)

  try {
    // Tìm thành viên trong đội
    const teamMember = await TeamMember.findOne({ teamId, memberId });
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Chỉ cho phép cập nhật thành "teamLeader" hoặc "member"
    const validRoles = ["teamLeader", "member"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Cập nhật vai trò của thành viên trong team
    teamMember.role = role;
    await teamMember.save();

    res.status(200).json({
      message: `Team member role updated to ${role}`,
      data: { teamMember },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  registerTeam,
  updateTeamResults,
  filterTeamsByAchievement,
  assignTeamMemberRole,
  createTeam,
  getAllTeams,
};
