const pool = require("../config/db");
const AppError = require("../src/utils/AppError");

const getTrustScore = async (userId) => {
    const result = await pool.query(
        `select score_after from trust_logs where user_id = $1 order by created_at desc limit 1`,
        [userId]
    );
    return result.rows[0].score_after || 0;
};
module.exports = {
    getTrustScore,
};