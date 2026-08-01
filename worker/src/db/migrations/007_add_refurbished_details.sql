-- Migration: Add condition and refurbished_details columns to products table
-- Run this against your Cloudflare D1 database

ALTER TABLE products ADD COLUMN condition TEXT DEFAULT 'new';
ALTER TABLE products ADD COLUMN refurbished_details TEXT; -- JSON (RefurbishedDetails)
