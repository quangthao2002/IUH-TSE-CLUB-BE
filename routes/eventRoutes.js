const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { auth, authorize } = require("../middleware/auth");

// /api/events/status?statusEvent=upcoming
router.get("/", eventController.getAllEvents); // Lấy danh sách sự kiện
router.get("/status", eventController.getEventsByStatus);
router.post("/create", auth, eventController.createEvent); // Tạo sự kiện mới
router.post("/approve", eventController.approveEventRequest); // Duyệt hoặc từ chối yêu cầu sự kiện
router.get("/host-requests/:eventId", eventController.getHostRequests);
router.post("/register/:eventId", eventController.registerForEvent); // Đăng ký tham gia sự kiện
router.put("/cancel/:id", eventController.cancelEvent); // Hủy sự kiện (thay đổi trạng thái)
router.delete(
  "/:eventId",
  auth,
  authorize("admin"),
  eventController.deleteEvent
);
router.get("/:id", eventController.getEvent); // Lấy thông tin sự kiện
router.put("/:id", eventController.updateEvent); // Cập nhật sự kiện

// // Endpoint để đăng ký làm chủ trì
// router.post("/:eventId/register-host", eventController.registerHostRequest);

// // Endpoint để duyệt yêu cầu làm chủ trì
// router.patch(
//   "/:eventId/approve-host/:memberId",
//   eventController.approveHostRequest
// );

module.exports = router;
