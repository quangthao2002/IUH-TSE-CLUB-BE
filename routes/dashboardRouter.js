const express = require("express");
const router = express.Router();

const dashBoardController = require("../controllers/dashboardController");

router.get("/", dashBoardController.getCountDashboard);

module.exports = router;
