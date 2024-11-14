const TeamMember = require("../models/TeamMember");

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
    res
      .status(200)
      .json({ message: `Member has been ${action}d`, data: { teamMember } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
module.exports = { approveMember };
