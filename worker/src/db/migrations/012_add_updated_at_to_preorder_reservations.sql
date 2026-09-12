-- Migration 012: Add updated_at column to preorder_reservations
ALTER TABLE preorder_reservations ADD COLUMN updated_at DATETIME;
