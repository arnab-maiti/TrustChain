const pool = require("../config/db");
const AppError = require("../src/utils/AppError");

const generateOTP = async (productId) => {
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [
    productId,
  ]);
  const product = result.rows[0];

  if (!product) {
    throw new AppError("Product not found", 404);
  }
  if (product.status !== "out-of-delivery") {
    throw new AppError("Product is not available for delivery", 400);
  }
  await pool.query("DELETE FROM delivery_otps WHERE product_id = $1", [
    productId,
  ]);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  await pool.query(
    "INSERT INTO delivery_otps (product_id, otp, expires_at) VALUES ($1, $2, $3)",
    [productId, otp, expiresAt]
  );
  return otp;
};

const verifyOTP = async (productId, otp) => {
  const result = await pool.query(
    "SELECT * FROM delivery_otps WHERE product_id = $1",
    [productId]
  );
  const otpRecord = result.rows[0];
  if (!otpRecord) {
    throw new AppError("OTP not found for this product", 404);
  }
  if (otpRecord.expires_at < new Date()) {
    throw new AppError("OTP has expired", 400);
  }
  if (otpRecord.verified === true) {
    throw new AppError("OTP has already been used", 400); }
  if (otpRecord.attempt_count >= 5) {
    throw new AppError("Maximum OTP attempts exceeded", 400); }
  if (otpRecord.otp !== otp) {
    const attemptCount = (otpRecord.attempt_count || 0) + 1;
    await pool.query(
      "UPDATE delivery_otps SET attempt_count = $1 WHERE product_id = $2",
      [attemptCount, productId]
    );
    throw new AppError("Invalid OTP", 400);
  }
  await pool.query(
    "UPDATE delivery_otps SET verified = true WHERE product_id = $1",
    [productId]
  );
  return "delivery confirmed";
};

module.exports = {
  generateOTP,
  verifyOTP,
};
