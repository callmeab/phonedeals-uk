-- =============================================================================
-- Migration 011: iPhone 18 Pro / Pro Max Pre-Booking Tables & Seeds
-- PhoneDeals UK — D1 Database
-- =============================================================================

DROP TABLE IF EXISTS preorder_products;
DROP TABLE IF EXISTS preorder_reservations;

-- 1. Pre-order Products Table (Model, Storage, Color Variants)
CREATE TABLE preorder_products (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  model          TEXT    NOT NULL,                  -- 'iPhone 18 Pro' | 'iPhone 18 Pro Max'
  display_size   TEXT    NOT NULL,                  -- '6.3-inch' | '6.9-inch'
  storage        TEXT    NOT NULL,                  -- '256GB' | '512GB' | '1TB' | '2TB'
  color          TEXT    NOT NULL,                  -- 'Black' | 'Silver' | 'Glacier' | 'Burgundy'
  price_gbp      REAL    NOT NULL,                  -- Full UK RRP
  deposit_amount REAL    NOT NULL DEFAULT 99.00,    -- 100% Refundable reservation deposit
  stock_status   TEXT    NOT NULL DEFAULT 'available', -- 'available' | 'limited' | 'sold_out'
  release_date   TEXT    NOT NULL DEFAULT '2026-09-18',
  image_path     TEXT    NOT NULL,                  -- Relative asset path (e.g. /assets/preorder/iphone18/pro-black.png)
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_preorder_products_model ON preorder_products(model);
CREATE INDEX IF NOT EXISTS idx_preorder_products_stock ON preorder_products(stock_status);

-- 2. Pre-order Customer Reservations Table
CREATE TABLE IF NOT EXISTS preorder_reservations (
  id                 TEXT     PRIMARY KEY,          -- UUID
  reservation_ref    TEXT     NOT NULL UNIQUE,      -- e.g. PRE18-A7X92
  customer_name      TEXT     NOT NULL,
  customer_email     TEXT     NOT NULL,
  customer_phone     TEXT     NOT NULL,
  model              TEXT     NOT NULL,
  storage            TEXT     NOT NULL,
  color              TEXT     NOT NULL,
  purchase_type      TEXT     NOT NULL DEFAULT 'outright', -- 'outright' | 'contract'
  network            TEXT,                          -- 'SIM-Free' | 'EE' | 'O2' | 'Vodafone' | 'Three'
  contract_months    INTEGER  DEFAULT 0,
  price_gbp          REAL     NOT NULL,
  deposit_amount     REAL     NOT NULL DEFAULT 99.00,
  deposit_status     TEXT     NOT NULL DEFAULT 'PAID',     -- 'PAID' | 'PENDING' | 'REFUNDED'
  status             TEXT     NOT NULL DEFAULT 'CONFIRMED',-- 'CONFIRMED' | 'PROCESSING' | 'ALLOCATED' | 'CANCELLED'
  marketing_opt_in   INTEGER  DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_preorder_reservations_ref   ON preorder_reservations(reservation_ref);
CREATE INDEX IF NOT EXISTS idx_preorder_reservations_email ON preorder_reservations(customer_email);

-- =============================================================================
-- Seed: 32 Variants (2 Models × 4 Storages × 4 Colors)
-- Base UK RRP Pricing:
-- iPhone 18 Pro (6.3-inch):     256GB=£1,199, 512GB=£1,399, 1TB=£1,599, 2TB=£1,799
-- iPhone 18 Pro Max (6.9-inch): 256GB=£1,299, 512GB=£1,499, 1TB=£1,699, 2TB=£1,899
-- Deposit: £99.00 across all models (100% Refundable)
-- =============================================================================

-- --- iPhone 18 Pro (6.3-inch) ---
-- 256GB
INSERT INTO preorder_products (model, display_size, storage, color, price_gbp, deposit_amount, stock_status, release_date, image_path)
VALUES
  ('iPhone 18 Pro', '6.3-inch', '256GB', 'Black',    1199.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-black.webp'),
  ('iPhone 18 Pro', '6.3-inch', '256GB', 'Silver',   1199.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-silver.webp'),
  ('iPhone 18 Pro', '6.3-inch', '256GB', 'Glacier',  1199.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-Glacier.webp'),
  ('iPhone 18 Pro', '6.3-inch', '256GB', 'Burgundy', 1199.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-Burgundy.webp');

-- 512GB
INSERT INTO preorder_products (model, display_size, storage, color, price_gbp, deposit_amount, stock_status, release_date, image_path)
VALUES
  ('iPhone 18 Pro', '6.3-inch', '512GB', 'Black',    1399.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-black.webp'),
  ('iPhone 18 Pro', '6.3-inch', '512GB', 'Silver',   1399.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-silver.webp'),
  ('iPhone 18 Pro', '6.3-inch', '512GB', 'Glacier',  1399.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-Glacier.webp'),
  ('iPhone 18 Pro', '6.3-inch', '512GB', 'Burgundy', 1399.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-Burgundy.webp');

-- 1TB
INSERT INTO preorder_products (model, display_size, storage, color, price_gbp, deposit_amount, stock_status, release_date, image_path)
VALUES
  ('iPhone 18 Pro', '6.3-inch', '1TB', 'Black',    1599.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-black.webp'),
  ('iPhone 18 Pro', '6.3-inch', '1TB', 'Silver',   1599.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-silver.webp'),
  ('iPhone 18 Pro', '6.3-inch', '1TB', 'Glacier',  1599.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-Glacier.webp'),
  ('iPhone 18 Pro', '6.3-inch', '1TB', 'Burgundy', 1599.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-Burgundy.webp');

-- 2TB
INSERT INTO preorder_products (model, display_size, storage, color, price_gbp, deposit_amount, stock_status, release_date, image_path)
VALUES
  ('iPhone 18 Pro', '6.3-inch', '2TB', 'Black',    1799.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-black.webp'),
  ('iPhone 18 Pro', '6.3-inch', '2TB', 'Silver',   1799.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-silver.webp'),
  ('iPhone 18 Pro', '6.3-inch', '2TB', 'Glacier',  1799.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-Glacier.webp'),
  ('iPhone 18 Pro', '6.3-inch', '2TB', 'Burgundy', 1799.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-Burgundy.webp');

-- --- iPhone 18 Pro Max (6.9-inch) ---
-- 256GB
INSERT INTO preorder_products (model, display_size, storage, color, price_gbp, deposit_amount, stock_status, release_date, image_path)
VALUES
  ('iPhone 18 Pro Max', '6.9-inch', '256GB', 'Black',    1299.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-black.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '256GB', 'Silver',   1299.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-silver.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '256GB', 'Glacier',  1299.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-Glacier.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '256GB', 'Burgundy', 1299.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-Burgundy.webp');

-- 512GB
INSERT INTO preorder_products (model, display_size, storage, color, price_gbp, deposit_amount, stock_status, release_date, image_path)
VALUES
  ('iPhone 18 Pro Max', '6.9-inch', '512GB', 'Black',    1499.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-black.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '512GB', 'Silver',   1499.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-silver.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '512GB', 'Glacier',  1499.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-Glacier.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '512GB', 'Burgundy', 1499.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-Burgundy.webp');

-- 1TB
INSERT INTO preorder_products (model, display_size, storage, color, price_gbp, deposit_amount, stock_status, release_date, image_path)
VALUES
  ('iPhone 18 Pro Max', '6.9-inch', '1TB', 'Black',    1699.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-black.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '1TB', 'Silver',   1699.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-silver.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '1TB', 'Glacier',  1699.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-Glacier.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '1TB', 'Burgundy', 1699.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-Burgundy.webp');

-- 2TB
INSERT INTO preorder_products (model, display_size, storage, color, price_gbp, deposit_amount, stock_status, release_date, image_path)
VALUES
  ('iPhone 18 Pro Max', '6.9-inch', '2TB', 'Black',    1899.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-black.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '2TB', 'Silver',   1899.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-silver.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '2TB', 'Glacier',  1899.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-Glacier.webp'),
  ('iPhone 18 Pro Max', '6.9-inch', '2TB', 'Burgundy', 1899.00, 99.00, 'available', '2026-09-18', '/iphone-18/iphone-18-pro-max-Burgundy.webp');
