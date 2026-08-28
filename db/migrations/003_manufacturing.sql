-- Migration 003: Phase 2 — Manufacturing/QC, linking products to a locked requirement
ALTER TABLE products
  ADD COLUMN requirement_id UUID REFERENCES requirements(id) ON DELETE RESTRICT,
  ADD COLUMN qc_passed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN qc_notes TEXT,
  ADD COLUMN certificate_url TEXT,
  ADD COLUMN production_completed_at TIMESTAMPTZ;

-- One product per requirement — a locked requirement is manufactured exactly once
CREATE UNIQUE INDEX idx_products_requirement_unique
  ON products(requirement_id)
  WHERE requirement_id IS NOT NULL;

ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'PRODUCTION_COMPLETED';