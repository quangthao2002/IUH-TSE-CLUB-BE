const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema(
  {
    competitionName: { type: String, required: true },
    competitionDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const achievementSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: "Competition" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    result: String,
  },
  { timestamps: true }
);

const Competition = mongoose.model("Competition", competitionSchema);
const Achievement = mongoose.model("Achievement", achievementSchema);

module.exports = { Competition, Achievement };
