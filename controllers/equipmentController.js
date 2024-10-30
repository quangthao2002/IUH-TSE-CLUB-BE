const Equipment = require("../models/Equipment");

// Xem thông tin thiết bị (cho cả admin và user)
const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate(
      "currentBorrower"
    );
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Thêm thiết bị (admin)
const createEquipment = async (req, res) => {
  const { name, type, quantity } = req.body;
  try {
    const newEquipment = new Equipment({
      name,
      type,
      quantity,
      available: quantity,
    });
    await newEquipment.save();
    res
      .status(201)
      .json({ message: "Equipment added", equipment: newEquipment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Cập nhật thông tin thiết bị (admin)
const updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { quantity, status, currentBorrower, borrowDate, returnDate } =
    req.body;
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { quantity, status, currentBorrower, borrowDate, returnDate },
      { new: true }
    );
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json({ message: "Equipment updated", equipment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Xóa thiết bị (admin)
const deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json({ message: "Equipment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
