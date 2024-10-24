const Team = require("../models/Team");
const TeamMember = require("../models/TeamMember");
const Achievement = require("../models/Achievement");

// đăng ký đội tuyển
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

    res
      .status(200)
      .json({ message: "Registration request sent, waiting for approval" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Duyệt hoặc từ chối thành viên
const approveMember = async (req, res) => {
  const { teamId, memberId } = req.params;
  const { action } = req.body; // "approve" hoặc "reject"

  try {
    const teamMember = await TeamMember.findOne({
      teamId: teamId,
      memberId: memberId,
    });

    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Cập nhật trạng thái của thành viên
    if (action === "approve") {
      teamMember.status = "approved";
    } else if (action === "reject") {
      teamMember.status = "rejected";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await teamMember.save();
    res.status(200).json({ message: `Member has been ${action}d` });
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

    res.status(200).json({ message: "Team results updated", achievement });
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

    res.status(200).json({ teamsWithAchievements });
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

    res
      .status(200)
      .json({ message: `Team member role updated to ${role}`, teamMember });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  registerTeam,
  approveMember,
  updateTeamResults,
  filterTeamsByAchievement,
  assignTeamMemberRole,
};
