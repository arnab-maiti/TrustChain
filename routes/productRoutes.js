const express = require('express');
const router = express.Router();
const protect = require('../src/middleware/authMiddleware');
const { createProduct,acceptShipment,markOutOfDelivery } = require('../controllers/productController');
const roleMiddleware = require('../src/middleware/roleMiddleware');
router.post('/',protect, roleMiddleware('manufacturer'), createProduct);
router.post('/:id/accept', protect, roleMiddleware('distributor'), acceptShipment);
router.post('/:id/out-of-delivery', protect, roleMiddleware('distributor'), markOutOfDelivery);
module.exports = router;