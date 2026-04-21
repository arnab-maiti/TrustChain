const {
  createDeliveryHash,
  getContract,
} = require('../services/blockchain.service');
const pool = require('../config/db');
const asyncHandler = require('../src/utils/asyncHandler');
const verifyDelivery = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const result = await pool.query(
    'SELECT id, status, courier_id, delivered_at FROM products WHERE id = $1',
    [productId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const product = result.rows[0];
  const status=product.status;
  // // Guard — must be delivered before verifying
  // if (product.status !== 'delivered') {
  //   return res.status(200).json({
  //     verified: false,
  //     message: 'Product not yet delivered',
  //   });
  // }

  // // Guard — delivered_at must exist
  // if (!product.delivered_at) {
  //   return res.status(200).json({
  //     verified: false,
  //     message: 'Delivery timestamp missing',
  //   });
  // }

  const newHash = createDeliveryHash(
    productId,
    product.courier_id || 'no-courier',
    product.status,
    product.delivered_at 
  );

  const isValid = await getContract().verifyHash(newHash);

  res.status(200).json({
    verified: isValid,
  });
});
module.exports = { verifyDelivery };

