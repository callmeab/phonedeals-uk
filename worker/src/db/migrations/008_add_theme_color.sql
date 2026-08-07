-- =============================================================================
-- Migration 008: Add Theme Color
-- Adds theme_color column to the categories table.
-- =============================================================================

ALTER TABLE categories ADD COLUMN theme_color TEXT NOT NULL DEFAULT '{"accent":"#2563eb","heroBackground":"radial-gradient(circle at 70% 18%, #b7cdf655 0, transparent 32%), linear-gradient(135deg, #10214f 0%, #020617 58%, #2563eb 145%)","heroGlow":"radial-gradient(circle, #2563eb80 0%, #2563eb28 38%, transparent 72%)","heroPanel":"linear-gradient(135deg, #2563eb 0%, #10214f 100%)"}';
