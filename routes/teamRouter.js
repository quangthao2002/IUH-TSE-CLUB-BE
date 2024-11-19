const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");

const teamController = require("../controllers/teamController");

router.get("/:id", teamController.getTeamById);
router.get("/", teamController.getAllTeams);
// Admin routes
router.put("/:teamId", auth, authorize("admin"), teamController.updateTeam);
router.post("/", auth, authorize("admin"), teamController.createTeam);
router.put(
  "/member/:memberId",
  auth,
  authorize("admin"),
  teamController.updateMemberStatus
);
router.delete("/:teamId", auth, authorize("admin"), teamController.deleteTeam);

// Member routes
router.post("/:teamId/join", teamController.requestJoinTeam);
router.delete("/:teamId/leave", teamController.leaveTeam);
router.get("/open", teamController.getOpenTeams);
router.get("/my-requests", teamController.getMyRequests);

module.exports = router;
