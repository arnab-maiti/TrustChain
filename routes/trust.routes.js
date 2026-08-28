const express = require("express");
const { getTrustScoreController } = require("../controllers/trust.controller");

const router = express.Router();
router.get("/:id/trust-score", getTrustScoreController);
module.exports = router;