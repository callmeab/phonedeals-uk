-- =============================================================================
-- Migration 014: Pre-Order Price Management & Audit History
-- PhoneDeals UK — D1 Database
--
-- Adds tracking columns to preorder_products and creates the audit log table
-- preorder_price_history to record all price and deposit changes made by admins.
-- =============================================================================

-- Add audit columns to preorder_products
ALTER TABLE preorder_products ADD COLUMN updated_at DATETIME;
ALTER TABLE preorder_products ADD COLUMN updated_by TEXT;

-- Create price history audit table
CREATE TABLE IF NOT EXISTS preorder_price_history (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id   INTEGER NOT NULL,
  old_price    REAL NOT NULL,
  new_price    REAL NOT NULL,
  old_deposit  REAL,
  new_deposit  REAL,
  changed_by   TEXT,
  changed_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES preorder_products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_preorder_price_history_product ON preorder_price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_preorder_price_history_changed_at ON preorder_price_history(changed_at);
