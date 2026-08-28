const express = require("express");
const router = express.Router();
const protect = require("../src/middleware/authMiddleware");
const roleMiddleware = require("../src/middleware/roleMiddleware");
const { createRequirementController, 
    getRequirementController,
     listRequirementsController ,
     assignRequirementController,
  approveRequirementController,
  rejectRequirementController,} = require("../controllers/requirementController");
console.log("protect:", typeof protect);
console.log("roleMiddleware:", typeof roleMiddleware);
console.log("createRequirementController:", typeof createRequirementController);
router.post("/", protect, roleMiddleware("customer"), createRequirementController);
router.patch("/:id/assign", protect, roleMiddleware("customer"), assignRequirementController);
router.get("/:id",protect,getRequirementController);
router.get("/",protect,listRequirementsController);
router.patch("/:id/approve", protect, approveRequirementController);
router.patch("/:id/reject", protect, rejectRequirementController);
module.exports = router;