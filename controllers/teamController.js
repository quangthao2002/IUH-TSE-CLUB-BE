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

const updateMemberStatus = async (req, res) => {
  const { memberId } = req.params; // ID của thành viên
  const { status } = req.body; // Trạng thái mới: "approved" hoặc "rejected"

  try {
    const updatedMember = await TeamMember.findByIdAndUpdate(
      memberId,
      { status },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({
      message: `Member status updated to ${status}`,
      member: updatedMember,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteTeam = async (req, res) => {
  const { teamId } = req.params;

  try {
    // Xóa đội
    const deletedTeam = await Team.findByIdAndDelete(teamId);
    if (!deletedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Xóa các thành viên liên quan
    await TeamMember.deleteMany({ teamId });

    res.status(200).json({
      message: "Team and related members deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params; // Lấy teamId từ URL parameters

    // Tìm đội tuyển theo ID
    const team = await Team.findById(id)
      .populate("teamLeader", "username email") // Lấy thông tin đội trưởng
      .populate("members", "username email"); // Lấy thông tin các thành viên trong đội

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Trả về thông tin đội tuyển
    res.json({
      message: "Team fetched successfully",
      data: team,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// API MEMBER
const requestJoinTeam = async (req, res) => {
  const { teamId } = req.params;
  const memberId = req.user.id; // Lấy ID thành viên từ token

  try {
    // Kiểm tra đội tồn tại
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Kiểm tra thành viên đã gửi yêu cầu trước đó chưa
    const existingRequest = await TeamMember.findOne({ memberId, teamId });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You already requested to join this team" });
    }

    // Tạo yêu cầu mới
    const newRequest = new TeamMember({ memberId, teamId });
    await newRequest.save();

    res.status(201).json({
      message: "Request to join team sent successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Rời khỏi đội tuyển
const leaveTeam = async (req, res) => {
  const { teamId } = req.params;
  const memberId = req.user.id; // Lấy ID thành viên từ token

  try {
    const member = await TeamMember.findOneAndDelete({ memberId, teamId });
    if (!member) {
      return res.status(404).json({ message: "You are not part of this team" });
    }

    res.status(200).json({ message: "Left the team successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// xem danh sach  đội tuyển mở
const getOpenTeams = async (req, res) => {
  try {
    const openTeams = await Team.find({ status: "open" })
      .populate("teamLeader", "name email")
      .exec();

    res.status(200).json({
      message: "Open teams fetched successfully",
      teams: openTeams,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getMyRequests = async (req, res) => {
  const memberId = req.user.id;

  try {
    const requests = await TeamMember.find({ memberId })
      .populate("teamId", "teamName status")
      .exec();

    res.status(200).json({
      message: "Your requests fetched successfully",
      requests,
    });
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

const updateTeam = async (req, res) => {
  const { teamId } = req.params; // Lấy teamId từ tham số URL
  const updateData = req.body; // Dữ liệu cập nhật từ body request

  try {
    // Kiểm tra xem team có tồn tại không
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Cập nhật thông tin team
    const updatedTeam = await Team.findByIdAndUpdate(teamId, updateData, {
      new: true, // Trả về team đã được cập nhật
    });

    res.status(200).json({
      message: "Team updated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  registerTeam,
  getTeamById,
  getMyRequests,
  getOpenTeams,
  leaveTeam,
  requestJoinTeam,
  deleteTeam,
  updateMemberStatus,
  createTeam,
  getAllTeams,
  updateTeam,
};
