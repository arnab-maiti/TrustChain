const asyncHandler = require("../src/utils/asyncHandler");
const { generateOTP, verifyOTP } = require("../services/otp.service");

const generateOtpController = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const otp = await generateOTP(productId);

  res.status(200).json({ success: true, otp });
});

const verifyOtpController = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { otp } = req.body;
  const message = await verifyOTP(productId, otp);

  res.status(200).json({ success: true, message });
});

module.exports = {
  generateOtpController,
  verifyOtpController,
};
