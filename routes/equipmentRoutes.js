const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipmentController");

router.get("/", equipmentController.getAllEquipment); // Lấy danh sách thiết bị

router.get("/:id", equipmentController.getEquipment); // Xem thiết bị
router.post("/", equipmentController.createEquipment); // Thêm thiết bị (admin)
router.put("/:id", equipmentController.updateEquipment); // Cập nhật thiết bị (admin)
router.delete("/:id", equipmentController.deleteEquipment); // Xóa thiết bị (admin)

module.exports = router;
