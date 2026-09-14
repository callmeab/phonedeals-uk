-- =============================================================================
-- Migration 013: Pre-Order Full Customer Details
-- PhoneDeals UK — D1 Database
--
-- Adds the same customer/order fields to preorder_reservations that the
-- normal checkout flow already captures in customers + orders tables.
-- Existing rows will have NULL for all new columns (backward-compatible).
-- =============================================================================

-- Personal details (split customer_name → first/last, add DOB & title)
ALTER TABLE preorder_reservations ADD COLUMN first_name TEXT;
ALTER TABLE preorder_reservations ADD COLUMN last_name TEXT;
ALTER TABLE preorder_reservations ADD COLUMN date_of_birth TEXT;
ALTER TABLE preorder_reservations ADD COLUMN title TEXT;

-- Delivery address (matching orders table structure)
ALTER TABLE preorder_reservations ADD COLUMN delivery_address_line1 TEXT;
ALTER TABLE preorder_reservations ADD COLUMN delivery_address_line2 TEXT;
ALTER TABLE preorder_reservations ADD COLUMN delivery_city TEXT;
ALTER TABLE preorder_reservations ADD COLUMN delivery_county TEXT;
ALTER TABLE preorder_reservations ADD COLUMN delivery_postcode TEXT;
ALTER TABLE preorder_reservations ADD COLUMN time_at_address TEXT;

-- Payment / Direct Debit (matching checkout Step 3)
ALTER TABLE preorder_reservations ADD COLUMN account_holder_name TEXT;
ALTER TABLE preorder_reservations ADD COLUMN sort_code TEXT;
ALTER TABLE preorder_reservations ADD COLUMN account_number TEXT;
ALTER TABLE preorder_reservations ADD COLUMN time_with_bank TEXT;

-- Insurance (matching checkout Step 2)
ALTER TABLE preorder_reservations ADD COLUMN insurance_plan TEXT DEFAULT 'none';
ALTER TABLE preorder_reservations ADD COLUMN insurance_billing TEXT DEFAULT 'monthly';

-- Deal reference (nullable — only set if customer chose a bundled network deal)
ALTER TABLE preorder_reservations ADD COLUMN deal_id INTEGER;
