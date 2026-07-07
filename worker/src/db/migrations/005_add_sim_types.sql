-- =============================================================================
-- Migration 005: Add sim_types to products
-- PhoneDeals UK — D1 Database
-- =============================================================================

ALTER TABLE products ADD COLUMN sim_types TEXT;