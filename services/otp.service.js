const pool = require("../config/db");
const AppError = require("../src/utils/AppError");
const { logEvent } = require("./event.service");
const generateOTP = async (productId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query("SELECT * FROM products WHERE id = $1", [
      productId,
    ]);
    const product = result.rows[0];

    if (!product) {
      throw new AppError("Product not found", 404);
    }
    if (product.status !== "out-of-delivery") {
      throw new AppError("Product is not available for delivery", 400);
    }

    await client.query("DELETE FROM delivery_otp WHERE product_id = $1", [
      productId,
    ]);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await client.query(
      "INSERT INTO delivery_otps (product_id, otp, expires_at) VALUES ($1, $2, $3)",
      [productId, otp, expiresAt]
    );
     await logEvent(
      productId,
      "OTP_GENERATED",
      "OTP generated for delivery confirmation",
     ); 
    await client.query("COMMIT");
    return otp;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const verifyOTP = async (productId, otp) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      "SELECT id, status, courier_id FROM products WHERE id = $1",
      [productId]
    );
    const product = productResult.rows[0];
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    if (product.status !== "out-of-delivery") {
      throw new AppError("Product is not out for delivery", 400);
    }

    const result = await client.query(
      "SELECT * FROM delivery_otps WHERE product_id = $1 ORDER BY created_at DESC LIMIT 1",
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
      throw new AppError("OTP has already been used", 400);
    }
    if (otpRecord.otp !== otp) {
      throw new AppError("Invalid OTP", 400);
    }

    await client.query("UPDATE delivery_otps SET verified = true WHERE id = $1", [
      otpRecord.id,
    ]);
    await client.query(
      "UPDATE products SET status = 'delivered' WHERE id = $1",
      [productId]
    );

    if (product.courier_id) {
      const trustUpdateResult = await client.query(
        "UPDATE users SET trust_score = LEAST(100, trust_score + 10) WHERE id = $1 RETURNING trust_score",
        [product.courier_id]
      );

      if (trustUpdateResult.rows[0]) {
        await client.query(
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
    
    await logEvent(productId, "DELIVERY_COMPLETED", "Product delivered");
    await client.query("COMMIT");
    return "delivery confirmed";
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  generateOTP,
  verifyOTP,
};
