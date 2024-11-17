const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    eventDate: { type: Date, required: true },
    statusEvent: {
      type: String,
      enum: ["upcoming", "passed", "cancelled"],
      default: "upcoming",
    },
    statusRequest: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    maxParticipants: { type: Number },
    registeredParticipants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
