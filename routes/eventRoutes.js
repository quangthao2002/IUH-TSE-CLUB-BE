const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/:id", eventController.getEvent); // Xem sự kiện
router.post("/", eventController.createEvent); // Đăng sự kiện (admin)
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
