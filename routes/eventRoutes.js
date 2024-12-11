const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { auth, authorize } = require("../middleware/auth");
const upload = require("../utils/upload");

// /api/events/status?statusEvent=upcoming
router.get("/", eventController.getAllEvents); // Lấy danh sách sự kiện
router.get("/status", eventController.getEventsByStatus);
router.post(
  "/create",
  auth,
  upload.single("plant"),
  eventController.createEvent
); // Tạo sự kiện mới
router.post("/approve", eventController.approveEventRequest); // Duyệt hoặc từ chối yêu cầu sự kiện
router.get("/host-requests/:eventId", eventController.getHostRequests);
router.post("/register/:eventId", auth, eventController.registerForEvent); // Đăng ký tham gia sự kiện
router.put("/cancel/:id", eventController.cancelEvent); // Hủy sự kiện (thay đổi trạng thái)
router.delete(
  "/:eventId",
  auth,
  authorize("admin"),
  eventController.deleteEvent
);
router.get("/:id", eventController.getEvent); // Lấy thông tin sự kiện
router.put("/:id", eventController.updateEvent); // Cập nhật sự kiện
// xuat danh sach nguoi tham gia su kien ra file excel
router.get("/export-event/:eventId", eventController.exportEventParticipants);
router.post("/:eventId/check-in", eventController.checkInEvent); // Check-in sự kiện
router.get("/check-in-list/:eventId", eventController.getCheckInList); // Lấy danh sách check-in sự kiện

module.exports = router;
