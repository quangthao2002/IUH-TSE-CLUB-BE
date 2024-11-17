const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipmentController");
const { auth, authorize } = require("../middleware/auth");

router.post(
  "/create",
  auth,
  authorize("admin"),
  equipmentController.createEquipment
); // Thêm thiết bị (admin)
router.post(
  "/approve-borrow",
  auth,
  authorize("admin"),
  equipmentController.approveBorrowRequest
); // Duyệt yêu cầu mượn thiết bị
router.post("/:equipmentId", auth, equipmentController.borrowEquipment);
router.get("/", equipmentController.getAllEquipment); // Lấy danh sách thiết bị

router.get("/:id", equipmentController.getEquipment); // Xem thiết bị

router.put("/:id", equipmentController.updateEquipment); // Cập nhật thiết bị (admin)
router.delete("/:id", equipmentController.deleteEquipment); // Xóa thiết bị (admin)

module.exports = router;
