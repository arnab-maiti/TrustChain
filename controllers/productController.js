const asyncHandler = require('../src/utils/asyncHandler');
const pool = require('../config/db');
const AppError = require('../src/utils/AppError');
const { logEvent } = require('../services/event.service');


// 🔥 CREATE PRODUCT
const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, batch_id } = req.body;

  if (!name || !batch_id) {
    throw new AppError("Name and batch_id are required", 400);
  }

  const result = await pool.query(
    `INSERT INTO products 
     (name, description, batch_id, manufacturer_id, current_owner_id) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [name, description, batch_id, req.user.id, req.user.id]
  );

  // ✅ EVENT
  await logEvent(
    result.rows[0].id,
    'PRODUCT_CREATED',
    'Product created by manufacturer',
    {
      actorId: req.user.id
    }
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});


// 🔥 ACCEPT SHIPMENT
const acceptShipment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Product not found', 404);
  }

  const updatedProduct = await pool.query(
    `UPDATE products 
     SET courier_id = $1, current_owner_id = $1, status = 'accepted' 
     WHERE id = $2 
     RETURNING *`,
    [req.user.id, id]
  );

  // ✅ EVENT
  await logEvent(
    id,
    'PRODUCT_ACCEPTED',
    'Shipment accepted by courier',
    {
      actorId: req.user.id,
      toUserId: req.user.id
    }
  );

  res.status(200).json({ success: true, data: updatedProduct.rows[0] });
});


// 🔥 OUT FOR DELIVERY
const markOutOfDelivery = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT * FROM products WHERE id = $1`,
    [id]
  );

  const product = result.rows[0];

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (product.status !== "accepted") {
    throw new AppError("Product is not in accepted status", 400);
  }

  if (product.courier_id !== req.user.id) {
    throw new AppError("Not your shipment", 403);
  }

  const updatedProduct = await pool.query(
    `UPDATE products 
     SET status = 'out-of-delivery' 
     WHERE id = $1 
     RETURNING *`,
    [id]
  );

  // ✅ EVENT
  await logEvent(
    id,
    'OUT_FOR_DELIVERY',
    'Shipment marked out for delivery',
    {
      actorId: req.user.id
    }
  );

  res.status(200).json({
    success: true,
    data: updatedProduct.rows[0]
  });
});

module.exports = {
  createProduct,
  acceptShipment,
  markOutOfDelivery
};