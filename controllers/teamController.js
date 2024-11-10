const Team = require("../models/Team");
const TeamMember = require("../models/TeamMember");
const Achievement = require("../models/Achievement");

const Competition = require("../models/Competition");

// API cho Admin tạo đội
const createTeam = async (req, res) => {
  const { teamName, teamLeader, competitionId } = req.body;

  try {
    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    const newTeam = new Team({
      teamName,
      teamLeader,
      competitionId,
      members: [],
    });

    await newTeam.save();

    res
      .status(201)
      .json({ message: "Team created successfully", data: { newTeam } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// Lấy danh sách đội tuyển của một cuộc thi: API này để hiển thị các đội tuyển đã đăng ký tham gia cuộc thi cụ thể.
const getTeamsByCompetition = async (req, res) => {
  const { competitionId } = req.params;

  try {
    const teams = await Team.find({ competitionId }).populate("members");
    res.status(200).json({ message: "Teams found", data: { teams } });
  } catch (error) {
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
  getTeamsByCompetition,
};
