const pool = require("../config/db");
const AppError = require("../src/utils/AppError");
const {
  createDeliveryHash,
  storeOnchain,
} = require("./blockchain.service");
const { logEvent } = require("./event.service");

const OTP_EXPIRY_MS = 2 * 60 * 1000;

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

    await client.query("DELETE FROM delivery_otps WHERE product_id = $1", [
      productId,
    ]);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await client.query(
      "INSERT INTO delivery_otps (product_id, otp, expires_at) VALUES ($1, $2, $3)",
      [productId, otp, expiresAt],
    );

    await logEvent(
      productId,
      "OTP_GENERATED",
      "OTP generated for delivery confirmation",
      {
        actorId: product.courier_id,
        client,
      },
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
  let chainPayload = null;

  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      "SELECT id, status, courier_id FROM products WHERE id = $1",
      [productId],
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
      [productId],
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
      await client.query(
        "UPDATE delivery_otps SET attempt_count = COALESCE(attempt_count, 0) + 1 WHERE id = $1",
        [otpRecord.id],
      );
      throw new AppError("Invalid OTP", 400);
    }

    await client.query(
      "UPDATE delivery_otps SET verified = true WHERE id = $1",
      [otpRecord.id],
    );

    const deliveredAt = Date.now();
    await client.query(
  `UPDATE products
   SET status = 'delivered', delivered_at = $1
   WHERE id = $2`,
  [deliveredAt, productId] 
);

    if (product.courier_id) {
      const trustUpdateResult = await client.query(
        "UPDATE users SET trust_score = LEAST(100, trust_score + 10) WHERE id = $1 RETURNING trust_score",
        [product.courier_id],
      );

      if (trustUpdateResult.rows[0]) {
        await client.query(
          "INSERT INTO trust_logs (user_id, change_value, score_after, reason) VALUES ($1, $2, $3, $4)",
          [
            product.courier_id,
            10,
            trustUpdateResult.rows[0].trust_score,
            "Successful delivery",
          ],
        );
      }
    }

    await logEvent(productId, "DELIVERY_COMPLETED", "Product delivered", {
      actorId: product.courier_id,
      client,
    });

    chainPayload = {
      hash: createDeliveryHash(
        productId,
        product.courier_id || "no-courier",
        "delivered",
        deliveredAt,
      ),
    };

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  let txHash = null;
  if (chainPayload) {
    try {
      txHash = await storeOnchain(chainPayload.hash);
      console.log("Stored on-chain:", txHash);
    } catch (error) {
      console.error("Delivery verified but blockchain storage failed:", error);
    }
  }

  return txHash
    ? `delivery confirmed (tx: ${txHash})`
    : "delivery confirmed";
};
module.exports = {
  generateOTP,
  verifyOTP,
};
