const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../middleware/auth");

const teamController = require("../controllers/teamController");

// get all teams
router.get("/", teamController.getAllTeams);

// API cho thành viên đăng ký tham gia đội
router.post(
  "/teams/register",
  auth,
  authorize("member", "visitor"),
  teamController.registerTeam
);
router.post("/teams", auth, authorize("admin"), teamController.createTeam);

// Cập nhật kết quả đội tuyển
router.put(
  "/teams/:teamId/results",
  auth,
  authorize("admin"),
  teamController.updateTeamResults
);

// Lọc đội tuyển theo thành tích
router.get("/teams/filter", auth, teamController.filterTeamsByAchievement);
router.get("/competition/:competitionId", teamController.getTeamsByCompetition);

module.exports = router;
