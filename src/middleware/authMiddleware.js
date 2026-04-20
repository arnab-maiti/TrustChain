try {
  require("dotenv").config();
} catch (error) {
  // The environment may already be injected by the runtime.
}

const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET || "secretkey";
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      return next();
    } catch (error) {
      return next(new AppError("Not authorized, token failed", 401));
    }
  }

  return next(new AppError("Not authorized, no token", 401));
};

module.exports = authMiddleware;
