-- =============================================================================
-- Migration 001: Initial Schema
-- PhoneDeals UK — D1 Database
--
-- Run locally:   wrangler d1 execute phonedeals-uk-db --file=worker/src/db/migrations/001_initial_schema.sql
-- Run remotely:  wrangler d1 execute phonedeals-uk-db --remote --file=worker/src/db/migrations/001_initial_schema.sql
-- =============================================================================

-- Categories: iPhone / Samsung (and any future additions)
CREATE TABLE IF NOT EXISTS categories (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  slug          TEXT    NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1   -- 0 | 1 (SQLite has no native BOOLEAN)
);

-- Products: one row per phone model
CREATE TABLE IF NOT EXISTS products (
  id                INTEGER  PRIMARY KEY AUTOINCREMENT,
  category_id       INTEGER  NOT NULL,
  name              TEXT     NOT NULL,
  slug              TEXT     NOT NULL UNIQUE,
  description       TEXT,
  storage_options   TEXT,    -- JSON array, e.g. '["128GB","256GB","512GB"]'
  colours           TEXT,    -- JSON array, e.g. '["Black Titanium","White Titanium"]'
  primary_image_url TEXT,
  gallery_images    TEXT,    -- JSON array of additional image URLs
  is_featured       INTEGER  NOT NULL DEFAULT 0,   -- 0 | 1
  is_active         INTEGER  NOT NULL DEFAULT 1,   -- 0 | 1 (soft delete)
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Deals: one row per network offer for a product
-- NOTE: minutes and texts use INTEGER, with 9999 representing "Unlimited"
CREATE TABLE IF NOT EXISTS deals (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id      INTEGER NOT NULL,
  network         TEXT    NOT NULL,        -- 'EE' | 'O2' | 'Vodafone' | 'Three' | 'Sky Mobile' | 'iD Mobile' | 'BT Mobile'
  contract_months INTEGER NOT NULL,        -- 12 | 24 | 36
  monthly_cost    REAL    NOT NULL,        -- GBP, e.g. 29.99
  upfront_cost    REAL    NOT NULL DEFAULT 0.0,
  data_gb         INTEGER NOT NULL,        -- GB value; 9999 = Unlimited
  minutes         INTEGER NOT NULL DEFAULT 9999, -- 9999 = Unlimited
  texts           INTEGER NOT NULL DEFAULT 9999, -- 9999 = Unlimited
  deal_highlights TEXT,                    -- JSON array, max 4 items
  is_active       INTEGER NOT NULL DEFAULT 1,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Admins: panel authentication
CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  email         TEXT     NOT NULL UNIQUE,
  password_hash TEXT     NOT NULL,   -- PBKDF2-SHA256 encoded as hex: "salt:iterations:hash"
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for hot query paths
CREATE INDEX IF NOT EXISTS idx_products_slug        ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active   ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_deals_product_id     ON deals(product_id);
CREATE INDEX IF NOT EXISTS idx_deals_is_active      ON deals(is_active);
CREATE INDEX IF NOT EXISTS idx_deals_network        ON deals(network);
