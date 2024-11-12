const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true },
    teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Đội trưởng
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      required: true, // Đội phải thuộc về một cuộc thi
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" }], // Danh sách thành viên trong đội
    // achievements: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "Achievement" },
    // ],
    status: { type: String, enum: ["open", "closed"], default: "open" }, // Trạng thái đội (open: đang hoạt động, closed: đã hoàn thành)
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
