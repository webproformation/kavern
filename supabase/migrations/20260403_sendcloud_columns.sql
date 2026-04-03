-- Migration 20260403 : colonnes Sendcloud + Colis Ouvert

-- orders : ID colis Sendcloud + tracking (si pas déjà présent)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS sendcloud_parcel_id bigint,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS tracking_url text;

-- open_packages : ID colis Sendcloud + tracking + relay + poids consolidé
ALTER TABLE open_packages
  ADD COLUMN IF NOT EXISTS sendcloud_parcel_id bigint,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS relay_point_id text,
  ADD COLUMN IF NOT EXISTS total_weight_grams integer DEFAULT 0;

-- Index pour retrouver rapidement les colis par parcel_id Sendcloud
CREATE INDEX IF NOT EXISTS idx_orders_sendcloud_parcel ON orders(sendcloud_parcel_id) WHERE sendcloud_parcel_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_open_packages_sendcloud_parcel ON open_packages(sendcloud_parcel_id) WHERE sendcloud_parcel_id IS NOT NULL;
