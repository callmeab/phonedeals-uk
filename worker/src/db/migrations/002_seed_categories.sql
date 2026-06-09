-- =============================================================================
-- Migration 002: Seed Categories
-- PhoneDeals UK — D1 Database
--
-- Run locally:   wrangler d1 execute phonedeals-uk-db --file=worker/src/db/migrations/002_seed_categories.sql
-- Run remotely:  wrangler d1 execute phonedeals-uk-db --remote --file=worker/src/db/migrations/002_seed_categories.sql
--
-- NOTE: Uses ON CONFLICT DO NOTHING so this is safe to re-run.
-- The site currently routes /iphone → category slug "iphone"
--                            /samsung → category slug "samsung"
-- If you add a third category here, you MUST also add:
--   1. A new Angular route + listing component
--   2. A new nav link in header.component.ts
--   3. A product API category filter entry in the Worker
-- =============================================================================

INSERT INTO categories (name, slug, display_order, is_active)
VALUES
  ('Apple iPhone',    'iphone',  1, 1),
  ('Samsung Galaxy',  'samsung', 2, 1)
ON CONFLICT(slug) DO NOTHING;
