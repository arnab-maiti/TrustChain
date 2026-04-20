try {
  require("dotenv").config();
} catch (error) {
  // The environment may already be injected by the runtime.
}

const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || "secretkey";

  return jwt.sign(
    { id: user.id, role: user.role },
    secret,
    { expiresIn: "5m" },
  );
};

module.exports = generateToken;
