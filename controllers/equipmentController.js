const Equipment = require("../models/Equipment");
const { sendNotificationEmail } = require("../utils/sendEmail");
const User = require("../models/User");

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
      .sort({ createdAt: -1 })
      .populate("currentBorrower");

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
const sendBorrowRequestEmail = async (user, equipment) => {
  const subject = "Borrow Request Submitted";
  const content = `
    <p>Xin chào ${user.username},</p>
    <p>Yêu cầu mượn thiết bị của bạn cho "<strong>${equipment.name}</strong>" đã được gửi thành công. Vui lòng chờ phê duyệt.</p>
    <p><strong>Thông tin chi tiết thiết bị:</strong></p>
    <ul>
      <li><strong>Tên thiết bị:</strong> ${equipment.name}</li>
      <li><strong>Loại thiết bị:</strong> ${equipment.type}</li>
      <li><strong>Số lượng:</strong> ${equipment.quantity}</li>
      <li><strong>Trạng thái:</strong> ${equipment.status}</li>
    </ul>
    <p>Chúng tôi sẽ thông báo cho bạn khi yêu cầu của bạn được phê duyệt hoặc từ chối.</p>
    <p>Trân trọng,</p>
    <p>Đội ngũ quản lý thiết bị</p>
  `;

  try {
    await sendNotificationEmail(user.email, subject, content);
    console.log("Borrow request email sent successfully.");
  } catch (error) {
    console.error("Error sending borrow request email:", error);
  }
};

const borrowEquipment = async (req, res) => {
  const userId = req.user.id; // Giả định userId lấy từ token đã xác thực
  const { equipmentId } = req.params;
  const { returnDate, purpose } = req.body;

  try {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    if (equipment.status !== "available" || equipment.available <= 0) {
      return res.status(400).json({ message: "Equipment is not available" });
    }

    // Đặt trạng thái chờ phê duyệt
    equipment.approvalStatus = "pending";
    equipment.status = "pending";
    equipment.currentBorrower = userId;
    equipment.borrowDate = new Date();
    equipment.returnDate = returnDate;
    equipment.purpose = purpose;

    // Không giảm `available` ngay tại đây
    await equipment.save();

    // Gửi email thông báo cho user muon thiết bị
    const user = await User.findById(userId);
    if (user) {
      sendBorrowRequestEmail(user, equipment);
    }

    res.json({ message: "Borrow request submitted", data: { equipment } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const approveBorrowRequest = async (req, res) => {
  const { equipmentId, action } = req.body; // action có thể là "approve" hoặc "reject"

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    if (equipment.approvalStatus !== "pending") {
      return res.status(400).json({
        message: "Borrow request is not pending or already processed",
      });
    }
    const user = await User.findById(equipment.currentBorrower);
    if (action === "approve") {
      // Xác nhận phê duyệt
      if (equipment.available <= 0) {
        return res.status(400).json({ message: "No equipment available" });
      }
      equipment.approvalStatus = "approved";
      equipment.status = "in use";
      equipment.available -= 1; // Giảm số lượng có sẵn
      // Gửi email thông báo phê duyệt
      subject = "Borrow Request Approved";
      content = `
        <p>Xin chào ${user.username},</p>
        <p>Yêu cầu mượn thiết bị của bạn cho "<strong>${equipment.name}</strong>" đã được phê duyệt.</p>
        <p><strong>Thông tin chi tiết thiết bị:</strong></p>
        <ul>
          <li><strong>Tên thiết bị:</strong> ${equipment.name}</li>
          <li><strong>Loại thiết bị:</strong> ${equipment.type}</li>
          <li><strong>Số lượng:</strong> ${equipment.quantity}</li>
          <li><strong>Trạng thái:</strong> ${equipment.status}</li>
        </ul>
        <p>Vui lòng liên hệ với quản lý để nhận thiết bị.</p>
        <p>Trân trọng,</p>
        <p>Đội ngũ quản lý thiết bị</p>
      `;
    } else {
      // Từ chối yêu cầu
      equipment.approvalStatus = "rejected";
      equipment.currentBorrower = null; // Xóa người mượn
      equipment.status = "available"; // Trả thiết bị về trạng thái ban đầu
      // Gửi email thông báo từ chối
      subject = "Borrow Request Rejected";
      content = `
      <p>Xin chào ${equipment.currentBorrower.username},</p>
      <p>Yêu cầu mượn thiết bị của bạn cho "<strong>${equipment.name}</strong>" đã bị từ chối.</p>
      <p><strong>Thông tin chi tiết thiết bị:</strong></p>
      <ul>
        <li><strong>Tên thiết bị:</strong> ${equipment.name}</li>
        <li><strong>Loại thiết bị:</strong> ${equipment.type}</li>
        <li><strong>Số lượng:</strong> ${equipment.quantity}</li>
        <li><strong>Trạng thái:</strong> ${equipment.status}</li>
      </ul>
      <p>Vui lòng liên hệ với quản lý để biết thêm chi tiết.</p>
      <p>Trân trọng,</p>
      <p>Đội ngũ quản lý thiết bị</p>
    `;
    }

    await equipment.save();
    // Gửi email thông báo cho user
    if (equipment.currentBorrower) {
      await sendNotificationEmail(user.email, subject, content);
    }
    res.json({
      message: `Borrow request ${action}d successfully`,
      data: { equipment },
    });
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
  console.log(req.body);
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
    console.error("Error creating equipment:", error);
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

const confirmReturnDevice = async (req, res) => {
  const { equipmentId } = req.params;
  const { statusHealth } = req.body; // Tình trạng thiết bị khi trả (good, normal, poor)

  try {
    // Tìm thiết bị theo ID
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // Kiểm tra trạng thái hiện tại của thiết bị
    if (
      equipment.status !== "in use" ||
      equipment.approvalStatus !== "approved"
    ) {
      return res
        .status(400)
        .json({ message: "This device is not currently in use" });
    }

    // Cập nhật trạng thái thiết bị
    equipment.status = "available";
    equipment.available += 1;
    equipment.currentBorrower = null;
    equipment.returnDate = new Date();
    equipment.statusHealth = statusHealth || "good"; // Lấy điều kiện từ client hoặc mặc định là "good"
    equipment.approvalStatus = "pending"; // Chuyển trạng thái chờ duyệt cho lần mượn tiếp theo

    await equipment.save();

    res.json({
      message: "Device returned successfully",
      equipment,
    });
  } catch (error) {
    console.error("Error confirming device return:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  borrowEquipment,
  getAllEquipment,
  approveBorrowRequest,
  confirmReturnDevice,
};
