const Equipment = require("../models/Equipment");

const getAllEquipment = async (req, res) => {
  try {
    const { q, status, page = 1, limit = 10 } = req.query;

    // Khởi tạo query filter
    const query = {};
    if (q) query.name = { $regex: q, $options: "i" }; // Tìm kiếm theo tên
    if (status) query.status = status; // Lọc theo trạng thái

    // Phân trang
    const skip = (page - 1) * limit;
    const totalEquipment = await Equipment.countDocuments(query);
    const equipment = await Equipment.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Trả về kết quả
    res.json({
      message: "Equipment fetched successfully",
      data: {
        total: totalEquipment,
        equipment,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEquipment / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Đăng ký mượn thiết bị
const borrowEquipment = async (req, res) => {
  const userId = req.user.id; // Giả định userId lấy từ token đã xác thực
  const { equipmentId } = req.params;
  const { returnDate } = req.body;

  try {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    if (equipment.status !== "available" || equipment.available <= 0) {
      return res.status(400).json({ message: "Equipment is not available" });
    }

    equipment.status = "in use";
    equipment.currentBorrower = userId;
    equipment.borrowDate = new Date();
    equipment.returnDate = returnDate;
    equipment.available -= 1;
    await equipment.save();

    res.json({ message: "Equipment borrowed", data: { equipment } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Xem thông tin thiết bị (cho cả admin và user)
const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate(
      "currentBorrower"
    );
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json({ message: "Equipment found", equipment });
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
      .json({ message: "Equipment added", data: { newEquipment } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Cập nhật thông tin thiết bị (admin)
const updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { quantity, status } = req.body;
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { quantity, status },
      { new: true }
    );
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json({ message: "Equipment updated", data: { equipment } });
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
    res.json({ message: "Equipment deleted", data: { equipment } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  borrowEquipment,
  getAllEquipment,
};
