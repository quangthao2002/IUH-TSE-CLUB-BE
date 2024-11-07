const Event = require("../models/Event");

// Đăng ký tham gia sự kiện
const registerForEvent = async (req, res) => {
  const userId = req.user.id; // Giả định userId lấy từ token đã xác thực
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.status !== "active") {
      return res.status(400).json({ message: "Event is not active" });
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
    res.json({ message: "Registered for event", data: event });
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

// Đăng thông tin sự kiện (admin)
const createEvent = async (req, res) => {
  const { eventName, location, description, eventDate, maxParticipants } =
    req.body;
  try {
    const newEvent = new Event({
      eventName,
      location,
      description,
      eventDate,
      maxParticipants,
    });
    await newEvent.save();
    res.status(201).json({ message: "Event created", event: newEvent });
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
    maxParticipants,
    status,
  } = req.body;
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { eventName, location, description, eventDate, maxParticipants, status },
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
      { status: "canceled" },
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

// POST /api/events/:eventId/register-host
const registerHostRequest = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id; // ID thành viên hiện tại, được lấy từ token xác thực

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Kiểm tra nếu thành viên đã là host hoặc đã có yêu cầu "pending"
    const alreadyHost = event.hosts.includes(userId);
    const pendingRequest = event.hostRequests.some(
      (request) =>
        request.memberId.toString() === userId && request.status === "pending"
    );

    if (alreadyHost) {
      return res
        .status(400)
        .json({ message: "You are already a host for this event" });
    }
    if (pendingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending host request" });
    }

    // Thêm yêu cầu đăng ký làm chủ trì với trạng thái "pending"
    event.hostRequests.push({ memberId: userId, status: "pending" });
    await event.save();

    res
      .status(200)
      .json({ message: "Host request submitted, awaiting approval" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const approveHostRequest = async (req, res) => {
  const { eventId, memberId } = req.params;
  const { action } = req.body; // "approve" hoặc "reject"

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Tìm yêu cầu đăng ký làm chủ trì của thành viên
    const hostRequest = event.hostRequests.find(
      (request) => request.memberId.toString() === memberId
    );

    if (!hostRequest) {
      return res.status(404).json({ message: "Host request not found" });
    }

    // Cập nhật trạng thái yêu cầu
    if (action === "approve") {
      hostRequest.status = "approved";
      event.hosts.push(memberId); // Thêm thành viên vào danh sách hosts
    } else if (action === "reject") {
      hostRequest.status = "rejected";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await event.save();
    res.status(200).json({ message: `Host request ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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

module.exports = {
  getEvent,
  createEvent,
  updateEvent,
  cancelEvent,
  registerForEvent,
  registerHostRequest,
  approveHostRequest,
  getHostRequests,
};
