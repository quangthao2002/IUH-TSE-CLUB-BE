const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: "Competition" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    result: String,
    points: Number,
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Achievement = mongoose.model("Achievement", achievementSchema);
module.exports = Achievement;
