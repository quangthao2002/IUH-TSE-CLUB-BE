const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { auth, authorize } = require("../middleware/auth");

router.get("/", eventController.getAllEvents); // Lấy danh sách sự kiện
router.post("/", auth, eventController.createEvent); // Đăng sự kiện
router.get("/:id", eventController.getEvent); // Xem sự kiện
router.put("/:id", eventController.updateEvent); // Cập nhật sự kiện (admin)
router.patch("/:id/cancel", eventController.cancelEvent); // Hủy sự kiện (admin)

// Endpoint để đăng ký làm chủ trì
router.post("/:eventId/register-host", eventController.registerHostRequest);

// Endpoint để duyệt yêu cầu làm chủ trì
router.patch(
  "/:eventId/approve-host/:memberId",
  eventController.approveHostRequest
);

// Endpoint để lấy danh sách yêu cầu làm chủ trì
router.get("/:eventId/host-requests", eventController.getHostRequests);
module.exports = router;
