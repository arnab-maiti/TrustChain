const asyncHandler = require("../src/utils/asyncHandler");
const AppError = require("../src/utils/AppError");
const { createUser,LoginUser } = require("../services/authService");
const generateToken = require("../src/utils/generateToken");
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new AppError("All fields are required", 400);
  }

  const user = await createUser({ name, email, password, role });

  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }
  
  const user = await LoginUser({ email, password });
  const token = generateToken(user);
  res.status(200).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
});
module.exports = { registerUser, loginUser };
