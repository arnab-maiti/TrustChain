const pool = require("../config/db");
const AppError = require("../src/utils/AppError");

const getTrustScore = async (userId) => {
    const result = await pool.query(
        `select score_after from trust_logs where user_id = $1 order by created_at desc limit 1`,
        [userId]
    );

    if (result.rows.length === 0) {
        const userResult = await pool.query(
            `select trust_score from users where id = $1 limit 1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new AppError("User not found", 404);
        }

        return userResult.rows[0].trust_score;
    }

    return result.rows[0].score_after;
};
module.exports = {
    getTrustScore,
};
