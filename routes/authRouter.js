const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControlller");

router.post("/refresh-token", authController.refreshAccessToken);

module.exports = router;
