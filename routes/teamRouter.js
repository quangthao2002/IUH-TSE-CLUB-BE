const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");

const teamController = require("../controllers/teamController");

router.post("/join/:teamId/", auth, teamController.requestJoinTeam);
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
router.delete("/:teamId", auth, teamController.deleteTeam);

// Member routes
router.delete("/:teamId/leave", auth, teamController.leaveTeam);
router.get("/open", teamController.getOpenTeams);
router.get("/my-requests", auth, teamController.getMyRequests);

module.exports = router;
