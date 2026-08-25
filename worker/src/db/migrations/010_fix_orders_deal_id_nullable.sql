-- =============================================================================
-- Migration 010: Make deal_id nullable on orders table
-- PhoneDeals UK — D1 Database
--
-- Root cause: The orders table was created in migration 003 with
-- `deal_id INTEGER NOT NULL`. Outright purchases (no deal) send dealId=null
-- from the frontend, causing a NOT NULL constraint violation → 500 error.
--
-- SQLite does not support ALTER COLUMN, so we recreate the table.
-- =============================================================================

-- 1. Create new table with deal_id nullable
CREATE TABLE orders_new (
  id                          TEXT PRIMARY KEY,
  customer_id                 TEXT NOT NULL,
  deal_id                     INTEGER,            -- NOW NULLABLE for outright purchases
  status                      TEXT NOT NULL,
  total_price                 REAL,
  created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  billing_address_line1       TEXT,
  billing_address_line2       TEXT,
  billing_city                TEXT,
  billing_county              TEXT,
  billing_postcode            TEXT,
  delivery_address_line1      TEXT NOT NULL DEFAULT '',
  delivery_address_line2      TEXT,
  delivery_city               TEXT NOT NULL DEFAULT '',
  delivery_county             TEXT,
  delivery_postcode           TEXT NOT NULL DEFAULT '',
  same_as_delivery            INTEGER DEFAULT 1,
  network_provider            TEXT NOT NULL DEFAULT '',
  contract_summary_accepted   INTEGER DEFAULT 0,
  contract_summary_accepted_at TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (deal_id)     REFERENCES deals(id)
);

-- 2. Copy existing data
INSERT INTO orders_new SELECT * FROM orders;

-- 3. Drop original table
DROP TABLE orders;

-- 4. Rename new table
ALTER TABLE orders_new RENAME TO orders;
