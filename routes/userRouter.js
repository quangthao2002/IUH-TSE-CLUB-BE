// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const eventController = require("../controllers/eventController");
const trainingController = require("../controllers/trainingController");
const equipmentController = require("../controllers/equipmentController");

const { auth, authorize } = require("../middleware/auth");

const { check, validationResult } = require("express-validator");

// Đăng ký
router.post(
  "/register",
  // [
  //   check("username", "user name is require").not().isEmpty(),
  //   check("email", "Please include a valid email").isEmail(),
  //   check("phone", "Phone number must be valid").isMobilePhone(),
  //   check("password", "Password must be at least 6 characters").isLength({
  //     min: 6,
  //   }),
  // ],
  userController.registerUser
);

// Đăng nhập
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);

// Lấy thông tin profile (cần xác thực)
router.get("/profile", auth, userController.getUserProfile);

// lấy thông tin user by id
router.get("/member/:id", userController.getMemberById);

// lấy thông tin tất cả user
// router.get("/members", userController.getAllMembers);
router.get("/members", userController.filterAndSearchMembers);
// cập nhật thông tin user
router.put("/member/:id", userController.updateMember);

// xóa user
router.delete("/member/:id", userController.deleteMember);

// loc member by skill level
router.get("/members/filter", userController.filterMembers);

// searchMember
router.get("/members/search", userController.searchMembers);

// Cập nhật hồ sơ cá nhân
router.put("/profile", userController.updateUserProfile);

// Đăng ký tham gia event
router.post("/events/:eventId/register", eventController.registerForEvent);

// Đăng ký làm người đào tạo cho khóa sau
router.post(
  "/training/:trainingSessionId/trainer",
  trainingController.registerAsTrainer
);
// đăng ký mượn thiết bị
router.post(
  "/equipment/:equipmentId/borrow",
  equipmentController.borrowEquipment
);

module.exports = router;
