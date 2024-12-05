const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/refresh-token", authController.refreshAccessToken);

router.get("/verify-email", authController.verifyEmail);
module.exports = router;
