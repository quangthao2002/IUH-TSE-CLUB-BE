const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true }, // Tên nhóm
  description: { type: String }, // Mô tả nhóm
  teamLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  }, // Leader của nhóm
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách thành viên đã được chấp nhận
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách yêu cầu tham gia
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Người tạo nhóm (Admin)
  status: { type: String, enum: ["open", "closed"], default: "open" }, // Trạng thái nhóm: mở hoặc đóng
  createdAt: { type: Date, default: Date.now }, // Ngày tạo nhóm
  updatedAt: { type: Date, default: Date.now }, // Ngày cập nhật gần nhất
});

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
