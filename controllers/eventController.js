const Event = require("../models/Event");
const XLSX = require("xlsx");
const User = require("../models/User");
const { sendNotificationEmail } = require("../utils/sendEmail");

const getAllEvents = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query; // Các tham số query

    // Khởi tạo truy vấn
    const query = {};
    if (q)
      query.$or = [
        { eventName: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ]; // Tìm kiếm theo tên

    // Phân trang
    const skip = (page - 1) * limit;
    const totalEvents = await Event.countDocuments(query);
    const events = await Event.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian
      .populate("registeredParticipants")
      .populate("host");
    if (totalEvents === 0) {
      return res.status(404).json({
        message: "No events found matching the search criteria",
      });
    }
    // Trả về kết quả
    res.json({
      message: "Events fetched successfully",
      data: {
        total: totalEvents,
        events,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEvents / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Xem thông tin sự kiện (cho cả admin và user)
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.status === "canceled") {
      return res
        .status(404)
        .json({ message: "Event not found or has been canceled" });
    }
    res.json({ message: "Event found", event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Đăng thông tin sự kiện
const createEvent = async (req, res) => {
  const userId = req.user.id; // Lấy ID từ token
  const userRole = req.user.role; // Lấy vai trò từ token
  const {
    eventName,
    location,
    description,
    eventDate,
    startTime,
    maxParticipants,
  } = req.body;

  try {
    if (new Date(eventDate) < new Date()) {
      return res
        .status(400)
        .json({ message: "Event date cannot be in the past" });
    }

    const statusRequest = userRole === "admin" ? "approved" : "pending";
    const statusEvent = userRole === "admin" ? "upcoming" : undefined;

    // Lấy URL file từ multer-S3 (nếu có)
    const planFile = req.file ? req.file.location : null;

    const newEvent = new Event({
      eventName,
      location,
      description,
      eventDate,
      startTime,
      maxParticipants,
      host: userId,
      statusRequest,
      plant: planFile,
      ...(statusEvent && { statusEvent }),
    });
    await newEvent.save();

    if (userRole != "admin") {
      const user = await User.findById(userId);
      // Gửi thông báo cho người dùng khi đăng kí sự kiện
      const subject = "Event Registration";
      const content = `
      <p>Xin chào ${user.username},</p>
      <p>Sự kiện "<strong>${eventName}</strong>" của bạn đã được tạo thành công.</p>
      <p>Trạng thái hiện tại của sự kiện: <strong>${
        statusRequest === "pending" ? "Chờ duyệt" : "Đã duyệt"
      }</strong>.</p>
      <p>Vui lòng chờ quản trị viên phê duyệt. Chúng tôi sẽ gửi email thông báo khi có cập nhật mới nhất.</p>
      <p>Trân trọng,</p>
      <p>Đội ngũ hỗ trợ</p>
    `;
      sendNotificationEmail(user.email, subject, content);
    }

    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Cập nhật thông tin sự kiện (admin)
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const {
    eventName,
    location,
    description,
    eventDate,
    startTime,
    maxParticipants,
    statusEvent,
  } = req.body;
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        eventName,
        location,
        description,
        eventDate,
        startTime,
        maxParticipants,
        statusEvent,
      },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event updated", event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Đăng ký tham gia sự kiện cho thành viên
const registerForEvent = async (req, res) => {
  const userId = req.user.id; // Giả định userId lấy từ token đã xác thực
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.statusEvent === "completed") {
      return res.status(400).json({ message: "Event has already completed" });
    }

    if (event.statusEvent === "cancelled") {
      return res.status(400).json({ message: "Event has been cancelled" });
    }

    if (event.statusEvent !== "upcoming") {
      return res
        .status(400)
        .json({ message: "Event is not open for registration" });
    }
    if (
      event.maxParticipants &&
      event.registeredParticipants.length >= event.maxParticipants
    ) {
      return res.status(400).json({ message: "Event is full" });
    }

    // Thêm thành viên vào danh sách tham gia
    event.registeredParticipants.push(userId);
    await event.save();
    res.json({ message: "Registered for event", data: { event } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Hủy bỏ sự kiện (admin)
const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { statusEvent: "canceled" },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event canceled", event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteEvent = async (req, res) => {
  const userRole = req.user.role; // Vai trò từ token
  const { eventId } = req.params; // Lấy ID sự kiện từ URL

  try {
    // Kiểm tra quyền của user
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Kiểm tra sự kiện có tồn tại không
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Thực hiện xóa sự kiện
    await Event.findByIdAndDelete(eventId);

    // Phản hồi thành công
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const approveEventRequest = async (req, res) => {
  const { eventId, action } = req.body; // action có thể là "approve" hoặc "reject"

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Cập nhật trạng thái yêu cầu
    event.statusRequest = action === "approve" ? "approved" : "rejected";

    if (action === "approve") {
      event.statusEvent = "upcoming"; // Nếu được duyệt, đặt trạng thái sự kiện là "upcoming"
    }

    await event.save();

    // Gửi email thông báo cho host
    const user = await User.findById(event.host);
    const subject = `Event Request ${
      action === "approve" ? "Approved" : "Rejected"
    }`;
    const content = `
    <p>Xin chào ${user.username},</p>
    <p>Sự kiện "<strong>${event.eventName}</strong>" của bạn đã ${
      action === "approve" ? "được duyệt" : "bị từ chối"
    }.</p>
    ${
      action === "approve"
        ? `<p>Trạng thái sự kiện hiện tại: <strong>${event.statusEvent}</strong>.</p>`
        : "<p>Vui lòng kiểm tra và chỉnh sửa lại nội dung nếu cần trước khi gửi lại yêu cầu phê duyệt.</p>"
    }
    <p>Trân trọng,</p>
    <p>Đội ngũ hỗ trợ</p>
  `;
    if (user && user.email) {
      sendNotificationEmail(user.email, subject, content);
    }

    res.json({ message: `Event ${action}d successfully`, event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getEventsByStatus = async (req, res) => {
  const { statusEvent, statusRequest } = req.query; // Nhận tham số lọc từ query parameters

  try {
    const filter = {};

    // Thêm điều kiện lọc nếu có tham số
    if (statusEvent) {
      filter.statusEvent = statusEvent;
    }
    if (statusRequest) {
      filter.statusRequest = statusRequest;
    }

    // Truy vấn sự kiện từ database
    const events = await Event.find(filter).populate("host", "name email"); // Populate host để lấy thêm thông tin chi tiết

    res.status(200).json({
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

const getHostRequests = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId).populate(
      "hostRequests.memberId",
      "username email"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res
      .status(200)
      .json({ message: "Host requests found", data: event.hostRequests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const slugify = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s\-_]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();
};

// API xuat thong tin user tham gia event ra file excel
const addEventInfoToSheet = (worksheet, event) => {
  // Thêm thông tin sự kiện vào sheet
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [`Sự kiện: ${event.eventName}`], // Tên sự kiện
    ],
    { origin: "A1" }
  );

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      ["Địa điểm:", event.location],
      ["Mô tả:", event.description],
      ["Ngày diễn ra:", new Date(event.eventDate).toLocaleString()],
    ],
    { origin: "A3" }
  );
};

const addParticipantsToSheet = (worksheet, participants) => {
  // Thêm tiêu đề cột
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [["STT", "Khoa", "Tên Sinh Viên", "Email"]],
    { origin: "A7" }
  );

  // Thêm danh sách người tham gia vào sheet
  const data = participants.map((participant, index) => [
    index + 1,
    participant.level || "Unknown",
    participant.username || "Unknown",
    participant.email || "Unknown",
  ]);

  XLSX.utils.sheet_add_aoa(worksheet, data, { origin: "A8" });
};

const exportEventParticipants = async (req, res) => {
  const { eventId } = req.params;

  try {
    // Lấy thông tin sự kiện từ cơ sở dữ liệu
    const event = await Event.findById(eventId)
      .populate("registeredParticipants") // Giả sử có liên kết người đăng ký
      .exec();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Tạo file Excel mới
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]); // Khởi tạo sheet trống

    // Thêm thông tin sự kiện vào sheet
    addEventInfoToSheet(worksheet, event);

    // Thêm danh sách người tham gia vào sheet
    addParticipantsToSheet(worksheet, event.registeredParticipants);

    // Thêm sheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

    // Đảm bảo tên file không có ký tự đặc biệt
    const sanitizedEventName = slugify(event.eventName, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    });
    const fileName = `Event_${sanitizedEventName}.xlsx`;

    // Tạo buffer thay vì ghi file ra disk
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Thiết lập header để tải file về máy user
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Gửi buffer về phía client
    res.send(excelBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getEvent,
  createEvent,
  updateEvent,
  cancelEvent,
  registerForEvent,
  approveEventRequest,
  getEventsByStatus,
  // registerHostRequest,
  // approveHostRequest,
  deleteEvent,
  getHostRequests,
  getAllEvents,
  exportEventParticipants,
};
