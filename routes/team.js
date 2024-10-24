const { auth, authorize } = require("../middleware/auth");

// Đăng ký đội tuyển
router.post(
  "/teams/register",
  auth,
  authorize("member", "visitor"),
  teamController.registerTeam
);

// Duyệt hoặc từ chối thành viên
router.put(
  "/teams/:teamId/members/:memberId/approve",
  auth,
  authorize("admin", "teamLeader"),
  teamController.approveMember
);

// Cập nhật kết quả đội tuyển
router.put(
  "/teams/:teamId/results",
  auth,
  authorize("admin"),
  teamController.updateTeamResults
);

// Lọc đội tuyển theo thành tích
router.get("/teams/filter", auth, teamController.filterTeamsByAchievement);
