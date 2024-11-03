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
    ],
    // Người chủ trì đã được phê duyệt
    hosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Yêu cầu làm chủ trì với trạng thái
    hostRequests: [
      {
        memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
