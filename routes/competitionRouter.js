const express = require("express");
const router = express.Router();
const competitionController = require("../controllers/CompetitionController");
router.get("/", competitionController.getAllCompetitions);
router.post("/create", competitionController.createCompetition);

module.exports = router;
