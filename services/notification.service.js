const pool = require("../config/db");
const sendEmail = require("../src/utils/sendEmail");

const notifyProductStatusChange = async (productId, statusLabel, message) => {
  try {
    const result = await pool.query(
      `SELECT p.name, p.batch_id,
              m.email AS manufacturer_email,
              c.email AS customer_email
       FROM products p
       LEFT JOIN users m ON m.id = p.manufacturer_id
       LEFT JOIN users c ON c.id = p.customer_id
       WHERE p.id = $1`,
      [productId],
    );

    if (result.rows.length === 0) return;

    const { name, batch_id, manufacturer_email, customer_email } = result.rows[0];
    const subject = `TrustChain: ${name} (${batch_id}) — ${statusLabel}`;

    const recipients = [...new Set([manufacturer_email, customer_email].filter(Boolean))];

    await Promise.all(recipients.map((to) => sendEmail(to, subject, message)));
  } catch (error) {
    console.error("Notification failed (non-fatal):", error.message);
  }
};

module.exports = { notifyProductStatusChange };