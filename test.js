const pool = require("./config/db");

(async () => {
  const res = await pool.query("SELECT NOW()");
  console.log(res.rows);
})();