const asyncHandler = require("../src/utils/asyncHandler");
const AppError = require("../src/utils/AppError");
const pool = require("../config/db");
const { generateOTP, verifyOTP } = require("../services/otp.service");

const generateOtpController = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const otp = await generateOTP(productId, req.user.id);

  res.status(200).json({ success: true, otp });
});

const verifyOtpController = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { otp } = req.body;

  if (!otp) {
    throw new AppError("OTP is required", 400);
  }

  const message = await verifyOTP(productId, otp);

  const result = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [productId]
  );

  if (result.rows.length === 0) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({ success: true, message, data: result.rows[0] });
});

module.exports = {
  generateOtpController,
  verifyOtpController,
};