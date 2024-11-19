const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true, unique: true }, // Tên đội
    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Đội trưởng (ID từ User)
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Thành viên (Danh sách ID từ User)
    description: { type: String }, // Mô tả đội
    // projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    status: { type: String, enum: ["open", "closed"], default: "open" }, // Trạng thái đội
    achievements: [{ type: String }], // Thành tích của đội
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Người tạo đội
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
