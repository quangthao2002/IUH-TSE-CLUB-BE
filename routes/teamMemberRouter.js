const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");

const TeamMemberController = require("../controllers/teamMemberController");

// API cho thành viên đăng ký tham gia đội

// Duyệt hoặc từ chối thành viên
router.patch(
  "/teams/:teamId/members/:memberId/approve",
  auth,
  authorize("admin", "teamLeader"),
  TeamMemberController.approveMember
);

module.exports = router;
