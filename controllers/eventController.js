const Event = require("../models/Event");

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
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian

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
    const newEvent = new Event({
      eventName,
      location,
      description,
      eventDate,
      startTime,
      maxParticipants,
      host: userId,
      statusRequest,
      ...(statusEvent && { statusEvent }),
    });
    await newEvent.save();

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

// POST /api/events/:eventId/register-host
// const registerHostRequest = async (req, res) => {
//   const { eventId } = req.params;
//   const userId = req.user._id; // ID thành viên hiện tại, được lấy từ token xác thực

//   try {
//     const event = await Event.findById(eventId);

//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     // Kiểm tra nếu thành viên đã là host hoặc đã có yêu cầu "pending"
//     const alreadyHost = event.hosts.includes(userId);
//     const pendingRequest = event.hostRequests.some(
//       (request) =>
//         request.memberId.toString() === userId && request.status === "pending"
//     );

//     if (alreadyHost) {
//       return res
//         .status(400)
//         .json({ message: "You are already a host for this event" });
//     }
//     if (pendingRequest) {
//       return res
//         .status(400)
//         .json({ message: "You already have a pending host request" });
//     }

//     // Thêm yêu cầu đăng ký làm chủ trì với trạng thái "pending"
//     event.hostRequests.push({ memberId: userId, status: "pending" });
//     await event.save();

//     res
//       .status(200)
//       .json({ message: "Host request submitted, awaiting approval" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// const approveHostRequest = async (req, res) => {
//   const { eventId, memberId } = req.params;
//   const { action } = req.body; // "approve" hoặc "reject"

//   try {
//     const event = await Event.findById(eventId);

//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     // Tìm yêu cầu đăng ký làm chủ trì của thành viên
//     const hostRequest = event.hostRequests.find(
//       (request) => request.memberId.toString() === memberId
//     );

//     if (!hostRequest) {
//       return res.status(404).json({ message: "Host request not found" });
//     }

//     // Cập nhật trạng thái yêu cầu
//     if (action === "approve") {
//       hostRequest.status = "approved";
//       event.hosts.push(memberId); // Thêm thành viên vào danh sách hosts
//     } else if (action === "reject") {
//       hostRequest.status = "rejected";
//     } else {
//       return res.status(400).json({ message: "Invalid action" });
//     }

//     await event.save();
//     res.status(200).json({ message: `Host request ${action}d successfully` });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

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
};
