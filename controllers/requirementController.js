const asyncHandler = require("../src/utils/asyncHandler");
const AppError = require("../src/utils/AppError");
const { createRequirement,
   getRequirementById,
    listRequirementsForUser,
    assignParticipants,
  approveRequirement,
  rejectRequirement, } = require("../services/requirement.service");
const createRequirementController =asyncHandler(async(req,res)=>{
  const {title, description, specifications} = req.body;
  if(!title){
    throw new AppError("Title is required", 400);
  }
  const requirement = await createRequirement({
    customerId : req.user.id,
    title,
    description,
    specifications
});
  res.status(201).json({
    success: true,
    data : requirement
  })
});

const getRequirementController = asyncHandler(async(req,res)=>{
    const requirement = await getRequirementById(req.params.id,req.user);
    res.status(200).json({
    success: true,
    data : requirement
  })
})

const listRequirementsController = asyncHandler(async(req,res)=>{
    const requirements = await listRequirementsForUser(req.user);
    res.status(200).json({
    success: true,
    count : requirements.length,
    data : requirements
  })
})
const assignRequirementController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { retailer_id, manufacturer_id } = req.body;

  if (!retailer_id || !manufacturer_id) {
    throw new AppError("retailer_id and manufacturer_id are required", 400);
  }

  const requirement = await assignParticipants(id, req.user.id, retailer_id, manufacturer_id);

  res.status(200).json({ success: true, data: requirement });
});
const approveRequirementController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requirement = await approveRequirement(id, req.user);

  res.status(200).json({ success: true, data: requirement });
});
const rejectRequirementController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const requirement = await rejectRequirement(id, req.user, reason);

  res.status(200).json({ success: true, data: requirement });
});

module.exports={
    createRequirementController,
    getRequirementController,
    listRequirementsController,
    assignRequirementController,
    approveRequirementController,
    rejectRequirementController
}