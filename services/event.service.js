const pool = require("../config/db");

const EVENT_TYPE_MAP = {
  PRODUCT_CREATED: "created",
  PRODUCT_ACCEPTED: "transferred",
  OUT_FOR_DELIVERY: "transferred",
  OTP_GENERATED: "transferred",
  DELIVERY_COMPLETED: "delivered",
};

const normalizeEventType = (eventType) => {
  return EVENT_TYPE_MAP[eventType] || eventType;
};

const logEvent = async (
  productId,
  eventType,
  notes,
  { actorId = null, toUserId = null, location = null, client = null } = {},
) => {
  const db = client || pool;
  const normalizedEventType = normalizeEventType(eventType);
  const enrichedNotes =
    normalizedEventType === eventType
      ? notes
      : `[${eventType}] ${notes}`;

  await db.query(
    `INSERT INTO product_events (product_id, actor_id, to_user_id, event_type, notes, location)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [productId, actorId, toUserId, normalizedEventType, enrichedNotes, location],
  );
};

module.exports = {
  logEvent,
};
