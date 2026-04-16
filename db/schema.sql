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
CREATE TABLE delivery_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  product_id UUID REFERENCES products(id) ON DELETE CASCADE,

  otp VARCHAR(6) NOT NULL,

  expires_at TIMESTAMP NOT NULL,

  verified BOOLEAN DEFAULT FALSE,

  attempt_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW()
);
ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE product_status ADD VALUE IF NOT EXISTS 'out-of-delivery';
ALTER TABLE products ADD COLUMN IF NOT EXISTS courier_id UUID REFERENCES users(id);
