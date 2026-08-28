const pool = require("../config/db");
const bcrypt = require("bcrypt");
const AppError = require("../src/utils/AppError");

const createUser = async ({ name, email, password, role }) => {
  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
};
const LoginUser = async ({ email, password }) => {
  const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (userResult.rows.length === 0) {
    throw new AppError("Invalid email or password", 401);
  }

  const user = userResult.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return user;
};
module.exports = {
  createUser,LoginUser
};
