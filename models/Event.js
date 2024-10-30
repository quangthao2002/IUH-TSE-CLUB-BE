const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    eventDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "canceled", "postponed"],
      default: "active",
    },
    maxParticipants: { type: Number },
    registeredParticipants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ], // Người dùng đã đăng ký
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
