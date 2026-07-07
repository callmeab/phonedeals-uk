CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  storage_options TEXT, -- JSON text
  colours TEXT, -- JSON text
  primary_image_url TEXT,
  gallery_images TEXT, -- JSON text
  variants TEXT, -- JSON text
  is_featured BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  network TEXT NOT NULL,
  contract_months INTEGER NOT NULL,
  monthly_cost REAL NOT NULL,
  upfront_cost REAL NOT NULL,
  data_gb REAL NOT NULL,
  minutes TEXT NOT NULL,
  texts TEXT NOT NULL,
  deal_highlights TEXT, -- JSON text
  is_active BOOLEAN DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_deals_product_id ON deals(product_id);

-- Seed an initial admin user
INSERT INTO admins (email, password_hash)
VALUES ('admin@phonedeals.co.uk', 'PLACEHOLDER_HASH_REPLACE_ME')
ON CONFLICT(email) DO NOTHING;
