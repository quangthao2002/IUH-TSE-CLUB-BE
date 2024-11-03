const mongoose = require("mongoose");

const trainingSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Tên buổi training
    description: { type: String }, // Mô tả về nội dung training
    date: { type: Date, required: true }, // Ngày tổ chức
    location: { type: String, required: true }, // Địa điểm tổ chức
    maxParticipants: { type: Number }, // Số lượng tối đa người tham gia
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Người chủ trì buổi training
    registeredParticipants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ], // Danh sách người dùng đã đăng ký
    skillsCovered: [{ type: String }], // Các kỹ năng sẽ được training
    status: {
      type: String,
      enum: ["scheduled", "completed", "canceled"],
      default: "scheduled",
    }, // Trạng thái buổi training
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingSession", trainingSessionSchema);
