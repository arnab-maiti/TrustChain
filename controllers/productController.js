const asyncHandler = require('../src/utils/asyncHandler');
const pool = require('../config/db');
const AppError = require('../src/utils/AppError');
const { logEvent } = require('../services/event.service');
const { notifyProductStatusChange } = require('../services/notification.service');


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

  await notifyProductStatusChange(
    result.rows[0].id,
    'Created',
    `Your product "${result.rows[0].name}" (batch ${result.rows[0].batch_id}) has been created and is now in production.`
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});


// 🔥 ACCEPT SHIPMENT (tightened: must be dispatched to THIS distributor)
const acceptShipment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Product not found', 404);
  }
  const product = result.rows[0];

  if (product.status !== 'dispatched') {
    throw new AppError(`Cannot accept from status '${product.status}'`, 400);
  }
  if (product.distributor_id !== req.user.id) {
    throw new AppError('This shipment was not dispatched to you', 403);
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
    'Shipment accepted by distributor',
    {
      actorId: req.user.id,
      toUserId: req.user.id
    }
  );

  await notifyProductStatusChange(
    id,
    'Accepted by Distributor',
    `Your shipment (batch ${product.batch_id}) has been accepted by the distributor.`
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

  await notifyProductStatusChange(
    id,
    'Out for Delivery',
    `Your shipment (batch ${product.batch_id}) is now out for delivery.`
  );

  res.status(200).json({
    success: true,
    data: updatedProduct.rows[0]
  });
});
const getAllProducts = asyncHandler(async (req, res) => {
 const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
  res.status(200).json({
    success: true,
    data: result.rows,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  
  if (result.rows.length === 0) {
    throw new AppError("Product not found", 404);
  }
  
  res.status(200).json({
    success: true,
    data: result.rows[0],
  });
});

const normalizeEvent = (type) => {
  const map = {
    PRODUCT_CREATED: "created",
    PRODUCT_ACCEPTED: "accepted",
    OUT_FOR_DELIVERY: "out_for_delivery",
    OTP_GENERATED: "otp_generated",
    OTP_VERIFIED: "otp_verified",
    DELIVERY_COMPLETED: "delivered"
  };

  return map[type] || type;
};

const getProductEvents = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    "SELECT * FROM product_events WHERE product_id = $1 ORDER BY created_at ASC",
    [id]
  );

  const normalized = result.rows.map(e => ({
    ...e,
    event_type: normalizeEvent(e.event_type)
  }));

  res.status(200).json({
    success: true,
    data: normalized
  });
});

// 🔥 CREATE PRODUCT FROM A LOCKED REQUIREMENT (Phase 2 entry point)
const createProductFromRequirement = asyncHandler(async (req, res) => {
  const { requirementId } = req.params;
  const { name, description, batch_id } = req.body;

  if (!name || !batch_id) {
    throw new AppError("Name and batch_id are required", 400);
  }

  const reqResult = await pool.query(
    "SELECT * FROM requirements WHERE id = $1",
    [requirementId]
  );
  const requirement = reqResult.rows[0];

  if (!requirement) {
    throw new AppError("Requirement not found", 404);
  }
  if (requirement.status !== "locked") {
    throw new AppError(`Requirement must be 'locked' to start manufacturing (currently '${requirement.status}')`, 400);
  }
  if (requirement.manufacturer_id !== req.user.id) {
    throw new AppError("You are not the manufacturer assigned to this requirement", 403);
  }

  const existing = await pool.query(
    "SELECT id FROM products WHERE requirement_id = $1",
    [requirementId]
  );
  if (existing.rows.length > 0) {
    throw new AppError("A product has already been created for this requirement", 400);
  }

  const result = await pool.query(
    `INSERT INTO products
     (name, description, batch_id, manufacturer_id, current_owner_id, customer_id, requirement_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, description, batch_id, req.user.id, req.user.id, requirement.customer_id, requirementId]
  );

  await logEvent(
    result.rows[0].id,
    'PRODUCT_CREATED',
    'Product created from locked requirement',
    { actorId: req.user.id }
  );

  await notifyProductStatusChange(
    result.rows[0].id,
    'Manufacturing Started',
    `Manufacturing has started for "${result.rows[0].name}" (batch ${result.rows[0].batch_id}).`
  );

  res.status(201).json({ success: true, data: result.rows[0] });
});

// 🔥 COMPLETE PRODUCTION (QC + certificate)
const completeProduction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { qc_passed, qc_notes, certificate_url } = req.body;

  if (qc_passed !== true) {
    throw new AppError("QC must pass (qc_passed: true) to complete production", 400);
  }

  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  const product = result.rows[0];

  if (!product) {
    throw new AppError("Product not found", 404);
  }
  if (product.manufacturer_id !== req.user.id) {
    throw new AppError("Not your product", 403);
  }
  if (product.production_completed_at) {
    throw new AppError("Production already marked complete for this product", 400);
  }

  const updated = await pool.query(
    `UPDATE products
     SET qc_passed = TRUE,
         qc_notes = $1,
         certificate_url = $2,
         production_completed_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [qc_notes || null, certificate_url || null, id]
  );

  await logEvent(
    id,
    'PRODUCTION_COMPLETED',
    'Manufacturer confirmed QC and completed production',
    { actorId: req.user.id }
  );

  await notifyProductStatusChange(
    id,
    'Production Completed',
    `Production and QC for "${product.name}" (batch ${product.batch_id}) is complete.`
  );

  res.status(200).json({ success: true, data: updated.rows[0] });
});

// 🔥 DISPATCH TO DISTRIBUTOR (Phase 3 start — manufacturer only, after QC)
const dispatchToDistributor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { distributor_id } = req.body;

  if (!distributor_id) {
    throw new AppError("distributor_id is required", 400);
  }

  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  const product = result.rows[0];

  if (!product) throw new AppError("Product not found", 404);
  if (product.manufacturer_id !== req.user.id) throw new AppError("Not your product", 403);
  if (!product.production_completed_at) {
    throw new AppError("Cannot dispatch before production/QC is complete", 400);
  }
  if (product.status !== 'created') {
    throw new AppError(`Cannot dispatch from status '${product.status}'`, 400);
  }

  const distCheck = await pool.query("SELECT id, role FROM users WHERE id = $1", [distributor_id]);
  if (!distCheck.rows[0] || distCheck.rows[0].role !== 'distributor') {
    throw new AppError("distributor_id must belong to a user with role 'distributor'", 400);
  }

  const updated = await pool.query(
    `UPDATE products
     SET distributor_id = $1, status = 'dispatched', dispatched_at = NOW()
     WHERE id = $2 RETURNING *`,
    [distributor_id, id]
  );

  await logEvent(id, 'DISPATCHED', 'Manufacturer dispatched product to distributor', { actorId: req.user.id });
  await notifyProductStatusChange(
    id,
    'Dispatched',
    `Product "${product.name}" (batch ${product.batch_id}) has been dispatched to the distributor.`
  );

  res.status(200).json({ success: true, data: updated.rows[0] });
});

// 🔥 DISPATCH TO RETAILER (Phase 4 start — distributor only, must currently hold it)
const dispatchToRetailer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { retailer_id } = req.body;

  if (!retailer_id) {
    throw new AppError("retailer_id is required", 400);
  }

  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  const product = result.rows[0];

  if (!product) throw new AppError("Product not found", 404);
  if (product.current_owner_id !== req.user.id) throw new AppError("Not your shipment", 403);
  if (product.status !== 'accepted') {
    throw new AppError(`Cannot send to retailer from status '${product.status}'`, 400);
  }

  const retCheck = await pool.query("SELECT id, role FROM users WHERE id = $1", [retailer_id]);
  if (!retCheck.rows[0] || retCheck.rows[0].role !== 'retailer') {
    throw new AppError("retailer_id must belong to a user with role 'retailer'", 400);
  }

  const updated = await pool.query(
    `UPDATE products SET retailer_id = $1, status = 'at_retailer' WHERE id = $2 RETURNING *`,
    [retailer_id, id]
  );

  await logEvent(id, 'DISPATCHED', 'Distributor sent product to retailer', { actorId: req.user.id });
  await notifyProductStatusChange(
    id,
    'Sent to Retailer',
    `Product "${product.name}" (batch ${product.batch_id}) has been sent to the retailer.`
  );

  res.status(200).json({ success: true, data: updated.rows[0] });
});

// 🔥 CONFIRM RETAILER RECEIPT (Phase 4 completion — retailer only)
const confirmRetailerReceipt = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  const product = result.rows[0];

  if (!product) throw new AppError("Product not found", 404);
  if (product.retailer_id !== req.user.id) throw new AppError("This shipment was not sent to you", 403);
  if (product.status !== 'at_retailer') {
    throw new AppError(`Cannot confirm receipt from status '${product.status}'`, 400);
  }

  // Reuses 'accepted' status + courier_id/current_owner_id, so the EXISTING
  // out-of-delivery + OTP flow works unchanged for retailer -> customer delivery.
  const updated = await pool.query(
    `UPDATE products
     SET courier_id = $1, current_owner_id = $1, status = 'accepted', retailer_received_at = NOW()
     WHERE id = $2 RETURNING *`,
    [req.user.id, id]
  );

  await logEvent(id, 'RETAILER_RECEIVED', 'Retailer confirmed receipt', { actorId: req.user.id, toUserId: req.user.id });
  await notifyProductStatusChange(
    id,
    'Received by Retailer',
    `Product "${product.name}" (batch ${product.batch_id}) has been received by the retailer.`
  );

  res.status(200).json({ success: true, data: updated.rows[0] });
});

module.exports = {
  createProduct,
  acceptShipment,
  markOutOfDelivery,
  getAllProducts,
  getProductById,
  getProductEvents,
  createProductFromRequirement,
  completeProduction,
  dispatchToDistributor,
  dispatchToRetailer,
  confirmRetailerReceipt
};