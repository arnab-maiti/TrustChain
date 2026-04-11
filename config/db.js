const { Pool } = require("pg");
try {
  require("dotenv").config();
} catch (error) {
  // The environment may already be injected by the runtime.
}
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "TrustChain",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

module.exports = pool;
