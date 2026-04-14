const express = require("express");
const router = express.Router();
const { generateOtpController, verifyOtpController } = require("../controllers/otp.controller");

router.post("/:productId/generate-otp", generateOtpController);
router.post("/:productId/verify-otp", verifyOtpController);
module.exports = router;