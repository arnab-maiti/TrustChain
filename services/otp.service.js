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
  await pool.query("DELETE FROM delivery_otp WHERE shipment_id = $1", [
    productId,
  ]);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  await pool.query(
    "INSERT INTO delivery_otp (shipment_id, otp_code, expires_at) VALUES ($1, $2, $3)",
    [productId, otp, expiresAt]
  );
  return otp;
};

const verifyOTP = async (productId, otp) => {
  const productResult = await pool.query(
    "SELECT id, status, courier_id FROM products WHERE id = $1",
    [productId]
  );
  const product = productResult.rows[0];
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const result = await pool.query(
    "SELECT * FROM delivery_otp WHERE shipment_id = $1 ORDER BY created_at DESC LIMIT 1",
    [productId]
  );
  const otpRecord = result.rows[0];
  if (!otpRecord) {
    throw new AppError("OTP not found for this product", 404);
  }
  if (otpRecord.expires_at < new Date()) {
    throw new AppError("OTP has expired", 400);
  }
  if (otpRecord.is_used === true) {
    throw new AppError("OTP has already been used", 400); }
  if (otpRecord.otp_code !== otp) {
    throw new AppError("Invalid OTP", 400);
  }
  await pool.query(
    "UPDATE delivery_otp SET is_used = true WHERE id = $1",
    [otpRecord.id]
  );
  await pool.query(
    "UPDATE products SET status = 'delivered' WHERE id = $1",
    [productId]
  );

  if (product.courier_id) {
    const trustUpdateResult = await pool.query(
      "UPDATE users SET trust_score = LEAST(100, trust_score + 10) WHERE id = $1 RETURNING trust_score",
      [product.courier_id]
    );

    if (trustUpdateResult.rows[0]) {
      await pool.query(
        "INSERT INTO trust_logs (user_id, change_value, score_after, reason) VALUES ($1, $2, $3, $4)",
        [
          product.courier_id,
          10,
          trustUpdateResult.rows[0].trust_score,
          "Successful delivery",
        ]
      );
    }
  }

  return "delivery confirmed";
};

module.exports = {
  generateOTP,
  verifyOTP,
};
