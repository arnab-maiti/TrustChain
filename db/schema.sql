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
create index idx_manufacturer_id on products(manufacturer_id);
create index idx_current_owner_id on products(current_owner_id);

CREATE TYPE event_type AS ENUM ('created','transferred','delivered','delayed','damaged');
CREATE TABLE product_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type event_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
create index idx_product_id on product_events(product_id);
create index idx_user_id on product_events(user_id);
create index idx_events_product_created on product_events(product_id,created_at desc);
create index idx_events_user_created on product_events(user_id,created_at desc);

create table trust_logs(
id uuid primary key default uuid_generate_v4(),
user_id uuid references users(id) on delete set null, 
change_value integer not null check (change_value between -100 and 100),
reason text not null,
related_event_id uuid references product_events(id) on delete set null,
created_at timestamptz not null default now()
);
create index idx_users_id on trust_logs(user_id);
create index idx_events_id on trust_logs(related_event_id);