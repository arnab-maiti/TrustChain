const asyncHandler = require("../src/utils/asyncHandler");
const pool = require("../config/db");
const getMyShipments = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const result = await pool.query(
    ` SELECT
      id,
      name,
      status,
      batch_id,
      integrity_verified
    FROM products
    WHERE customer_id = $1
    ORDER BY created_at DESC
    `,
    [customerId]
  );
  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
});
module.exports = {getMyShipments};