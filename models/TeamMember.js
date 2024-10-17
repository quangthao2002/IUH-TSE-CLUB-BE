const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"], // Trạng thái đăng ký
      default: "pending",
    },
    role: { type: String, default: "member" }, // Vai trò (leader, member)
    joinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

module.exports = TeamMember;
