const asyncHandler = require('../src/utils/asyncHandler');
const pool = require('../config/db');
const AppError = require('../src/utils/AppError');
const createProduct = asyncHandler(async (req, res, next) => {
    const { name, description, batch_id } = req.body;
    if (!name || !batch_id) {
  throw new AppError("Name and batch_id are required", 400);
}
    const result = await pool.query(
        'INSERT INTO products (name, description, batch_id, manufacturer_id,current_owner_id) VALUES ($1, $2, $3, $4,$5) RETURNING *',
        [name, description, batch_id, req.user.id, req.user.id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
});
module.exports = {
    createProduct
};
