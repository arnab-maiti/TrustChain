const express = require("express");
const router = express.Router();

const { verifyDelivery } = require("../controllers/blockchain.controller");

router.get("/verify/:productId", verifyDelivery);

module.exports = router;