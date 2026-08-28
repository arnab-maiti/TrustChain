const express = require("express");
const router = express.Router();
const protect = require("../src/middleware/authMiddleware");
const { generateOtpController, verifyOtpController } = require("../controllers/otp.controller");

router.post("/:productId/generate-otp", protect, generateOtpController);
router.post("/:productId/verify-otp", protect, verifyOtpController);
module.exports = router;