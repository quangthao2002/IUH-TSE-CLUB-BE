const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // Loại thiết bị (VD: màn hình, máy chiếu)
    quantity: { type: Number, default: 1 },
    available: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["available", "in use", "unavailable"],
      default: "available",
    },
    currentBorrower: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    borrowDate: { type: Date },
    returnDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Equipment", equipmentSchema);