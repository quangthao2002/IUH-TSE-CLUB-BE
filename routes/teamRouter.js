const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");

const teamController = require("../controllers/teamController");

// router.post("/join/:teamId/", auth, teamController.requestJoinTeam);
// router.get("/:id", teamController.getTeamById);
router.get("/", teamController.getAllTeams);
// // Admin routes
// router.put("/:teamId", auth, authorize("admin"), teamController.updateTeam);
// router.post("/", auth, authorize("admin"), teamController.createTeam);
// router.put(
//   "/member/:memberId",
//   auth,
//   authorize("admin"),
//   teamController.updateMemberStatus
// );
// router.delete("/:teamId", auth, teamController.deleteTeam);

// // Member routes
// router.delete("/:teamId/leave", auth, teamController.leaveTeam);
// router.get("/open", teamController.getOpenTeams);
// router.get("/my-requests", auth, teamController.getMyRequests);

router.post("/create", auth, authorize("admin"), teamController.createTeam);

// 2. Lấy danh sách yêu cầu tham gia của một nhóm (Chỉ admin hoặc leader nhóm đó)
router.get(
  "/:teamId/requests",
  auth,
  authorize(["admin", "leader"]), // Cho phép Admin và Leader xem
  teamController.getJoinRequests
);

// 3. Xử lý yêu cầu tham gia (Chấp nhận hoặc từ chối, chỉ admin hoặc leader)
router.post(
  "/:teamId/requests/:userId",
  auth,
  authorize(["admin", "leader"]), // Admin hoặc leader được phép duyệt
  teamController.handleJoinRequest
);

// 4. Lấy danh sách tất cả người dùng (Để chọn leader hoặc duyệt thành viên)
router.get(
  "/users",
  auth,
  authorize("admin"), // Chỉ admin lấy danh sách user
  teamController.getAllUsers
);

// Thay đổi leader của nhóm (Admin hoặc leader hiện tại)
router.put(
  "/:teamId/change-leader",
  auth,
  authorize(["admin", "leader"]), // Admin hoặc leader hiện tại
  teamController.changeTeamLeader
);

router.get("/open", auth, teamController.getOpenTeams);

module.exports = router;
