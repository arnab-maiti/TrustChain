const express = require('express');
const router = express.Router();
const protect = require('../src/middleware/authMiddleware');
const { createProduct,acceptShipment,markOutOfDelivery,getAllProducts,getProductEvents } = require('../controllers/productController');
const roleMiddleware = require('../src/middleware/roleMiddleware');

router.post('/',protect, roleMiddleware('manufacturer'), createProduct);
router.get('/', getAllProducts);
router.post('/:id/accept', protect, roleMiddleware('distributor'), acceptShipment);
router.post('/:id/out-of-delivery', protect, roleMiddleware('distributor'), markOutOfDelivery);
router.get('/:id/events', getProductEvents);
module.exports = router;