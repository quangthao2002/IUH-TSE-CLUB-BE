const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema(
  {
    competitionName: { type: String, required: true },
    competitionDate: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

const Competition = mongoose.model("Competition", competitionSchema);

module.exports = Competition;
