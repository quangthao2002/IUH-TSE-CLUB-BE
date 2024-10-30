// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { auth, authorize } = require("../middleware/auth");

const { check, validationResult } = require("express-validator");

// Đăng ký
router.post(
  "/register",
  [
    check("username", "user name is require").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("phone", "Phone number must be valid").isMobilePhone(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  userController.registerUser
);

// Đăng nhập
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  userController.loginUser
);

// Lấy thông tin profile (cần xác thực)
router.get("/profile", auth, userController.getUserProfile);

// lấy thông tin user by id
router.get("/member/:id", userController.getMemberById);

// lấy thông tin tất cả user
router.get("/members", userController.getAllMembers);

// cập nhật thông tin user
router.put("/member/:id", userController.updateMember);

// xóa user
router.delete("/member/:id", userController.deleteMember);

// loc member by skill level
router.get("/members/filter", userController.filterMembers);

// searchMember
router.get("/members/search", userController.searchMembers);

module.exports = router;
