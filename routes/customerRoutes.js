const express = require('express');
const router = express.Router();
const protect = require('../src/middleware/authMiddleware');
const roleMiddleware = require('../src/middleware/roleMiddleware');
const {getMyShipments,} = require("../controllers/customerController");
router.get('/shipments',protect,roleMiddleware('customer'),getMyShipments);

module.exports = router;