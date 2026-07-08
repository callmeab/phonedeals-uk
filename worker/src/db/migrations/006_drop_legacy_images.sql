-- SQLite ALTER TABLE DROP COLUMN requires SQLite 3.35.0+
ALTER TABLE products DROP COLUMN primary_image_url;
ALTER TABLE products DROP COLUMN gallery_images;
