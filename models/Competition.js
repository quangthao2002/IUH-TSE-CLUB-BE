const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema(
  {
    competitionName: { type: String, required: true },
    competitionDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Competition = mongoose.model("Competition", competitionSchema);

module.exports = Competition;
