-- =============================================================================
-- Migration 009: Add New Categories
-- PhoneDeals UK — D1 Database
--
-- Run locally:   wrangler d1 execute phonedeals-uk-db --local --file=worker/src/db/migrations/009_add_new_categories.sql
-- Run remotely:  wrangler d1 execute phonedeals-uk-db --remote --file=worker/src/db/migrations/009_add_new_categories.sql
--
-- NOTE: Uses ON CONFLICT DO NOTHING so this is safe to re-run.
-- =============================================================================

INSERT INTO categories (name, slug, display_order, is_active)
VALUES
  ('Mobile Accessories', 'mobile-accessories', 3, 1),
  ('iPad',               'ipad',               4, 1),
  ('Smart Watches',      'smart-watches',       5, 1)
ON CONFLICT(slug) DO NOTHING;
