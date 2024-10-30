const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/:id", eventController.getEvent); // Xem sự kiện
router.post("/", eventController.createEvent); // Đăng sự kiện (admin)
router.put("/:id", eventController.updateEvent); // Cập nhật sự kiện (admin)
router.patch("/:id/cancel", eventController.cancelEvent); // Hủy sự kiện (admin)

module.exports = router;
