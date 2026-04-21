CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TYPE user_role AS ENUM (
  'manufacturer',
  'distributor',
  'retailer',
  'admin'
);

CREATE TYPE product_status AS ENUM (
  'created',
  'in_transit',
  'delivered'
);

CREATE TYPE event_type AS ENUM (
  'created',
  'transferred',
  'delivered',
  'delayed',
  'damaged'
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL UNIQUE,
  password     TEXT        NOT NULL,
  role         user_role   NOT NULL,
  trust_score  INTEGER     NOT NULL DEFAULT 50
                           CHECK (trust_score BETWEEN 0 AND 100),
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_users_role        ON users(role);
CREATE INDEX idx_users_active      ON users(id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_users_trust_score ON users(trust_score)
  WHERE deleted_at IS NULL;

CREATE TABLE products (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT           NOT NULL,
  description      TEXT,
  batch_id         TEXT           NOT NULL UNIQUE,
  manufacturer_id  UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  current_owner_id UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status           product_status NOT NULL DEFAULT 'created',
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX idx_products_owner        ON products(current_owner_id);
CREATE INDEX idx_products_status       ON products(status);

CREATE TABLE product_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  actor_id        UUID        REFERENCES users(id) ON DELETE SET NULL,
  to_user_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  event_type      event_type  NOT NULL,
  notes           TEXT,
  location        TEXT,
  sequence_number BIGINT      NOT NULL DEFAULT 0,
  event_hash      TEXT,
  previous_hash   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_transfer_requires_recipient
    CHECK (
      event_type != 'transferred'
      OR to_user_id IS NOT NULL
    )
);

CREATE INDEX idx_pevents_product      ON product_events(product_id);
CREATE INDEX idx_pevents_actor        ON product_events(actor_id);
CREATE INDEX idx_pevents_product_time ON product_events(product_id, created_at DESC);
CREATE INDEX idx_pevents_actor_time   ON product_events(actor_id,   created_at DESC);
CREATE INDEX idx_pevents_sequence     ON product_events(product_id, sequence_number);

CREATE TABLE trust_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  change_value     INTEGER     NOT NULL CHECK (change_value BETWEEN -30 AND 30),
  score_after      INTEGER     NOT NULL CHECK (score_after  BETWEEN 0  AND 100),
  reason           TEXT        NOT NULL,
  related_event_id UUID        REFERENCES product_events(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tlogs_user      ON trust_logs(user_id);
CREATE INDEX idx_tlogs_event     ON trust_logs(related_event_id);
CREATE INDEX idx_tlogs_user_time ON trust_logs(user_id, created_at DESC);
CREATE INDEX idx_tlogs_negative  ON trust_logs(user_id)
  WHERE change_value < 0;
  INSERT INTO users (id, name, email, password, role)
VALUES
  (gen_random_uuid(), 'Arjun Sharma',   'arjun@nexus.com',    'hashed_pw_1', 'manufacturer'),
  (gen_random_uuid(), 'Priya Logistics','priya@fastroute.com', 'hashed_pw_2', 'distributor'),
  (gen_random_uuid(), 'Rahul Retail',   'rahul@citymart.com',  'hashed_pw_3', 'retailer'),
  (gen_random_uuid(), 'Admin User',     'admin@trustchain.com','hashed_pw_4', 'admin');
  SELECT id, name, role, trust_score, is_active FROM users;
  INSERT INTO products (id, name, batch_id, manufacturer_id, current_owner_id)
VALUES (
  gen_random_uuid(),
  'Electronic Sensors Batch',
  'BATCH-2241',
  (SELECT id FROM users WHERE role = 'manufacturer' LIMIT 1),
  (SELECT id FROM users WHERE role = 'manufacturer' LIMIT 1)
);
SELECT p.id, p.name, p.batch_id, p.status,
       u.name AS owner
FROM products p
JOIN users u ON u.id = p.current_owner_id;
SELECT name, updated_at FROM products WHERE batch_id = 'BATCH-2241';
UPDATE products
SET name = 'Electronic Sensors Batch v2'
WHERE batch_id = 'BATCH-2241';
INSERT INTO product_events (product_id, actor_id, event_type, notes, sequence_number)
VALUES (
  (SELECT id FROM products WHERE batch_id = 'BATCH-2241'),
  (SELECT id FROM users WHERE role = 'manufacturer' LIMIT 1),
  'created',
  'Product batch initialized',
  1
);
INSERT INTO product_events (product_id, actor_id, to_user_id, event_type, notes, sequence_number)
VALUES (
  (SELECT id FROM products WHERE batch_id = 'BATCH-2241'),
  (SELECT id FROM users WHERE role = 'manufacturer'  LIMIT 1),
  (SELECT id FROM users WHERE role = 'distributor' LIMIT 1),
  'transferred',
  'Shipped to FastRoute Logistics',
  2
);
INSERT INTO product_events (product_id, actor_id, event_type, notes, sequence_number)
VALUES (
  (SELECT id FROM products WHERE batch_id = 'BATCH-2241'),
  (SELECT id FROM users WHERE role = 'distributor' LIMIT 1),
  'delayed',
  'Customs hold at Mumbai port',
  3
);
SELECT pe.sequence_number, pe.event_type, pe.notes,
       a.name  AS actor,
       t.name  AS recipient
FROM product_events pe
LEFT JOIN users a ON a.id = pe.actor_id
LEFT JOIN users t ON t.id = pe.to_user_id
ORDER BY pe.sequence_number;
INSERT INTO product_events (product_id, actor_id, event_type, sequence_number)
VALUES (
  (SELECT id FROM products WHERE batch_id = 'BATCH-2241'),
  (SELECT id FROM users WHERE role = 'manufacturer' LIMIT 1),
  'transferred',
  4
);
INSERT INTO trust_logs (user_id, change_value, score_after, reason, related_event_id)
VALUES (
  (SELECT id FROM users WHERE role = 'distributor' LIMIT 1),
  -10,
  40,
  'Delivery delayed at customs',
  (SELECT id FROM product_events WHERE event_type = 'delayed' LIMIT 1)
);
UPDATE users
SET trust_score = 40
WHERE id = (SELECT id FROM users WHERE role = 'distributor' LIMIT 1);
SELECT u.name, u.trust_score, tl.change_value, tl.score_after, tl.reason
FROM trust_logs tl
JOIN users u ON u.id = tl.user_id;
DELETE FROM users
WHERE id = (SELECT id FROM users WHERE role = 'manufacturer' LIMIT 1);
UPDATE users
SET deleted_at = NOW(), is_active = FALSE
WHERE role = 'admin';
SELECT id, name, role FROM users
WHERE deleted_at IS NULL;

SELECT
  pe.sequence_number   AS seq,
  pe.event_type,
  pe.notes,
  pe.created_at,
  actor.name           AS performed_by,
  actor.role           AS actor_role,
  recipient.name       AS transferred_to,
  p.status             AS product_status
FROM product_events pe
JOIN products p       ON p.id  = pe.product_id
LEFT JOIN users actor ON actor.id = pe.actor_id
LEFT JOIN users recipient ON recipient.id = pe.to_user_id
WHERE p.batch_id = 'BATCH-2241'
ORDER BY pe.sequence_number;
CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
DECLARE
  change_val INTEGER;
BEGIN

  -- Step 1: decide change value
  IF NEW.event_type = 'delayed' THEN
    change_val := -10;
  ELSIF NEW.event_type = 'damaged' THEN
    change_val := -20;
  ELSIF NEW.event_type = 'delivered' THEN
    change_val := 5;
  ELSE
    RETURN NEW;
  END IF;

  -- Step 2: update users table
  UPDATE users
  SET trust_score = GREATEST(0, LEAST(100, trust_score + change_val))
  WHERE id = NEW.actor_id;

  -- Step 3: insert trust log
  INSERT INTO trust_logs (user_id, change_value, score_after, reason, related_event_id)
  VALUES (
    NEW.actor_id,
    change_val,
    (SELECT trust_score FROM users WHERE id = NEW.actor_id),
    NEW.event_type,
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_update_trust
AFTER INSERT ON product_events
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();
select * from users;
ALTER TABLE products ADD COLUMN courier_id UUID REFERENCES users(id);
ALTER TYPE product_status ADD VALUE 'accepted';
ALTER TYPE product_status ADD VALUE 'out-of-delivery';
CREATE TABLE delivery_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempt_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
ALTER TYPE event_type ADD VALUE 'PRODUCT_CREATED';
ALTER TYPE event_type ADD VALUE 'PRODUCT_ACCEPTED';
ALTER TYPE event_type ADD VALUE 'OUT_FOR_DELIVERY';
ALTER TYPE event_type ADD VALUE 'OTP_GENERATED';
ALTER TYPE event_type ADD VALUE 'OTP_VERIFIED';
ALTER TYPE event_type ADD VALUE 'DELIVERY_COMPLETED';
SELECT * FROM products;
ALTER TABLE product_events
DROP CONSTRAINT chk_transfer_requires_recipient;
ALTER TABLE products ADD COLUMN delivered_at BIGINT;
update products SET status = 'accepted' where id = '2a7d0a52-dc00-429f-8a86-c13f48fed55c';