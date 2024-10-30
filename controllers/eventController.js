const Event = require("../models/Event");

// Xem thông tin sự kiện (cho cả admin và user)
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.status === "canceled") {
      return res
        .status(404)
        .json({ message: "Event not found or has been canceled" });
    }
    res.json(event);
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

module.exports = { getEvent, createEvent, updateEvent, cancelEvent };
