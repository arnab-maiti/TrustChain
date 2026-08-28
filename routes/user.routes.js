const express = require("express");
const router = express.Router();
const { getTrustById } = require("../controllers/userController");

router.get("/trust/:id", getTrustById);

module.exports = router;