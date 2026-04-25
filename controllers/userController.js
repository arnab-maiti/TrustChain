const asyncHandler = require('../src/utils/asyncHandler');
const pool = require("../config/db");

const getTrustById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    "SELECT name, trust_score FROM users WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    data: result.rows[0],
  });
});

module.exports = { getTrustById };