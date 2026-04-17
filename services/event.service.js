const pool = require('../config/db');

const logEvent = async (
  productId,
  eventType,
  notes,
  { actorId = null, toUserId = null, location = null } = {}
) => {
  await pool.query(
    `INSERT INTO product_events (product_id, actor_id, to_user_id, event_type, notes, location)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [productId, actorId, toUserId, eventType, notes, location]
  );
};

module.exports = {
  logEvent,
};
