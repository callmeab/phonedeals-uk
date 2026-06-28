-- =============================================================================
-- Migration 004: Mobiles.co.uk Style Checkout
-- PhoneDeals UK — D1 Database
-- =============================================================================

-- ALTER customers table
-- Note: SQLite requires a DEFAULT value when adding a NOT NULL column to an existing table.
ALTER TABLE customers ADD COLUMN date_of_birth TEXT NOT NULL DEFAULT '1970-01-01'; 
ALTER TABLE customers ADD COLUMN title TEXT;
ALTER TABLE customers ADD COLUMN marketing_opt_in INTEGER DEFAULT 0;

-- CREATE INDEX
CREATE INDEX idx_customers_dob ON customers(date_of_birth);

-- VALIDATION RULE:
-- date_of_birth must represent an age of 18+ at time of order. 
-- This is validated in the Worker (Prompt B.2), not enforced at the DB level, 
-- since D1/SQLite does not support computed CHECK constraints comparing to 
-- the current date reliably across all SQLite builds.

-- ALTER orders table
ALTER TABLE orders ADD COLUMN billing_address_line1 TEXT;
ALTER TABLE orders ADD COLUMN billing_address_line2 TEXT;
ALTER TABLE orders ADD COLUMN billing_city TEXT;
ALTER TABLE orders ADD COLUMN billing_county TEXT;
ALTER TABLE orders ADD COLUMN billing_postcode TEXT;
ALTER TABLE orders ADD COLUMN delivery_address_line1 TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN delivery_address_line2 TEXT;
ALTER TABLE orders ADD COLUMN delivery_city TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN delivery_county TEXT;
ALTER TABLE orders ADD COLUMN delivery_postcode TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN same_as_delivery INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN network_provider TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN contract_summary_accepted INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN contract_summary_accepted_at TEXT;
