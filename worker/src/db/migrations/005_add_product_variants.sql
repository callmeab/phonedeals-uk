-- Migration: Add variants column to products table
ALTER TABLE products ADD COLUMN variants TEXT;
