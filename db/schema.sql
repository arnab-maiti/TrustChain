create type user_role as enum ('manufacturer', 'distributor', 'retailer', 'admin');
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password      TEXT NOT NULL,
  role          user_role NOT NULL,
  trust_score   INTEGER NOT NULL DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ 
);
create type product_status as enum('created','in_transit','delivered');
create table products(
id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
name          TEXT NOT NULL,
description   text,
batch_id      text not null unique,
manufacturer_id  uuid not null references users(id),
current_owner_id  uuid not null references users(id),
status         product_status not null default 'created',
created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);