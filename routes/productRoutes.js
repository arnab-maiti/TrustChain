const express = require('express');
const router = express.Router();
const protect = require('../src/middleware/authMiddleware');
const { createProduct } = require('../controllers/productController');
const roleMiddleware = require('../src/middleware/roleMiddleware');
router.post('/',protect, roleMiddleware('manufacturer'), createProduct);
module.exports = router;