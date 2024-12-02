const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");

const teamController = require("../controllers/teamController");
// API get all ,phan trang
router.get("/", teamController.getAllTeams);
// API get team by id
router.get("/:teamId", teamController.getTeamById);
// API tạo nhóm (Admin)
router.post("/create", auth, authorize("admin"), teamController.createTeam);
// API gửi yêu cầu tham gia nhóm (Member)
router.post("/join/:teamId", auth, teamController.requestJoinTeam);

// API xóa nhóm (Admin)
router.delete("/:teamId", auth, authorize("admin"), teamController.deleteTeam);

// API thêm thành viên vào nhóm (Chỉ admin hoặc leader)
router.post(
  "/:teamId/add-member",
  auth,
  authorize(["admin", "leader"]), // Admin hoặc leader được phép thêm
  teamController.addMemberToTeam
);
// API dong nhom (Chỉ admin hoặc leader)
router.put(
  "/:teamId/close",
  auth,
  authorize(["admin", "leader"]), // Chỉ admin hoặc leader mới có quyền
  teamController.closeTeam
);
// API mở lại nhóm
router.put(
  "/:teamId/reopen",
  auth,
  authorize(["admin", "leader"]), // Chỉ admin hoặc leader mới có quyền
  teamController.reopenTeam
);
// API loại bỏ thành viên khỏi nhóm
router.delete(
  "/:teamId/members",
  auth,
  authorize(["admin", "leader"]), // Chỉ admin hoặc leader mới có quyền
  teamController.removeMemberFromTeam
);

//API Lấy danh sách yêu cầu tham gia của một nhóm (Chỉ admin hoặc leader nhóm đó)
router.get(
  "/:teamId/requests",
  auth,
  authorize(["admin", "leader"]), // Cho phép Admin và Leader xem
  teamController.getJoinRequests
);

// Xử lý yêu cầu tham gia (Chấp nhận hoặc từ chối, chỉ admin hoặc leader)
router.post(
  "/:teamId/requests/:userId",
  auth,
  authorize(["admin", "leader"]), // Admin hoặc leader được phép duyệt
  teamController.handleJoinRequest
);

//  Lấy danh sách tất cả người dùng (Để chọn leader hoặc duyệt thành viên)
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

// update team
router.put("/:teamId", auth, authorize("admin"), teamController.updateTeam);
router.get("/open", auth, teamController.getOpenTeams);

module.exports = router;
