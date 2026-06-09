import { Hono } from 'hono';
import { Env, PaginatedResponse, Product } from '../types';
import { slugify } from '../utils/slugify';
import { validate, ValidationError } from '../utils/validate';
import { normalizeProductImages } from '../utils/image-url';

export const publicProductsRouter = new Hono<{ Bindings: Env }>();
export const adminProductsRouter = new Hono<{ Bindings: Env }>();

// --- PUBLIC ROUTES ---
publicProductsRouter.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const url = new URL(c.req.url);
    const categorySlug = url.searchParams.get('category');
    const isFeatured = url.searchParams.get('featured') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    let baseQuery = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params: any[] = [];

    if (categorySlug) {
      baseQuery += ` AND c.slug = ?`;
      params.push(categorySlug);
    }
    if (isFeatured) {
      baseQuery += ` AND p.is_featured = 1`;
    }

    const countResult: any = await db.prepare(`SELECT COUNT(*) as total ${baseQuery}`).bind(...params).first();
    const total = countResult?.total || 0;

    const dataQuery = `
      SELECT p.*, c.name as category_name
      ${baseQuery}
      ORDER BY p.is_featured DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const { results } = await db.prepare(dataQuery).bind(...params).all<Product>();
    const requestUrl = c.req.url;
    const publicR2Domain = c.env.R2_PUBLIC_URL;
    const normalized = results.map(p => normalizeProductImages(p, requestUrl, publicR2Domain));

    const page = Math.floor(offset / limit) + 1;

    return c.json({
      success: true,
      data: normalized,
      total,
      page,
      limit
    } as PaginatedResponse<Product>);
  } catch (err) {
    console.error('Fetch public products error:', err);
    return c.json({ success: false, error: 'Failed to fetch products' }, 500);
  }
});

publicProductsRouter.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const product = await c.env.DB.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.slug = ? AND p.is_active = 1
    `).bind(slug).first<Product>();

    if (!product) return c.json({ success: false, error: 'Product not found' }, 404);

    return c.json({
      success: true,
      data: normalizeProductImages(product, c.req.url, c.env.R2_PUBLIC_URL),
    });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to fetch product' }, 500);
  }
});


// --- PROTECTED ADMIN ROUTES ---
adminProductsRouter.get('/', async (c) => {
  try {
    const url = new URL(c.req.url);
    const search = url.searchParams.get('search');
    const categoryId = url.searchParams.get('category_id');
    const isActive = url.searchParams.get('is_active');

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND p.name LIKE ?`;
      params.push(`%${search}%`);
    }
    if (categoryId) {
      query += ` AND p.category_id = ?`;
      params.push(categoryId);
    }
    if (isActive !== null) {
      query += ` AND p.is_active = ?`;
      params.push(isActive === 'true' || isActive === '1' ? 1 : 0);
    }

    query += ` ORDER BY p.created_at DESC`;

    const { results } = await c.env.DB.prepare(query).bind(...params).all<Product>();
    const requestUrl = c.req.url;
    const publicR2Domain = c.env.R2_PUBLIC_URL;
    const normalized = results.map(p => normalizeProductImages(p, requestUrl, publicR2Domain));

    return c.json({ success: true, data: normalized });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to fetch admin products' }, 500);
  }
});

adminProductsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const product = await c.env.DB.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).bind(id).first<Product>();

    if (!product) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }

    return c.json({
      success: true,
      data: normalizeProductImages(product, c.req.url, c.env.R2_PUBLIC_URL),
    });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to fetch product' }, 500);
  }
});

adminProductsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json<any>();
    
    validate.required(body.name, 'Name');
    validate.required(body.category_id, 'Category ID');
    
    const slug = body.slug ? slugify(body.slug) : slugify(body.name);
    validate.required(slug, 'Slug');
    if (!validate.isValidSlug(slug)) {
      throw new ValidationError('Invalid slug format. Use lowercase alphanumeric characters and hyphens.');
    }

    const db = c.env.DB;
    
    // Check slug uniqueness
    const existing = await db.prepare('SELECT id FROM products WHERE slug = ?').bind(slug).first();
    if (existing) {
      return c.json({ success: false, error: 'Product slug already exists' }, 409);
    }

    const result = await db.prepare(`
      INSERT INTO products (
        category_id, name, slug, description, storage_options, colours, 
        primary_image_url, gallery_images, is_featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      body.category_id,
      body.name,
      slug,
      body.description || null,
      body.storage_options ? JSON.stringify(body.storage_options) : null,
      body.colours ? JSON.stringify(body.colours) : null,
      body.primary_image_url || null,
      body.gallery_images ? JSON.stringify(body.gallery_images) : null,
      body.is_featured ? 1 : 0,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1
    ).first<Product>();

    return c.json({
      success: true,
      data: normalizeProductImages(result!, c.req.url, c.env.R2_PUBLIC_URL),
    }, 201);
  } catch (err: any) {
    if (err instanceof ValidationError) {
      return c.json({ success: false, error: err.message }, 400);
    }
    return c.json({ success: false, error: 'Failed to create product' }, 500);
  }
});

adminProductsRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json<any>();
    const db = c.env.DB;

    const current = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first<Product>();
    if (!current) {
      return c.json({ success: false, error: 'Product not found' }, 404);
    }

    let slug = current.slug;
    if (body.slug) {
      slug = slugify(body.slug);
      if (!validate.isValidSlug(slug)) throw new ValidationError('Invalid slug format');
      
      const existing = await db.prepare('SELECT id FROM products WHERE slug = ? AND id != ?').bind(slug, id).first();
      if (existing) return c.json({ success: false, error: 'Slug already in use by another product' }, 409);
    }

    const updates: string[] = [];
    const params: any[] = [];

    const addUpdate = (field: string, val: any) => {
      updates.push(`${field} = ?`);
      params.push(val);
    };

    if (body.category_id !== undefined) addUpdate('category_id', body.category_id);
    if (body.name !== undefined) addUpdate('name', body.name);
    addUpdate('slug', slug);
    if (body.description !== undefined) addUpdate('description', body.description);
    
    if (body.storage_options !== undefined) {
      addUpdate('storage_options', typeof body.storage_options === 'string' ? body.storage_options : JSON.stringify(body.storage_options));
    }
    if (body.colours !== undefined) {
      addUpdate('colours', typeof body.colours === 'string' ? body.colours : JSON.stringify(body.colours));
    }
    if (body.primary_image_url !== undefined) addUpdate('primary_image_url', body.primary_image_url);
    if (body.gallery_images !== undefined) {
      addUpdate('gallery_images', typeof body.gallery_images === 'string' ? body.gallery_images : JSON.stringify(body.gallery_images));
    }
    if (body.is_featured !== undefined) addUpdate('is_featured', body.is_featured ? 1 : 0);
    if (body.is_active !== undefined) addUpdate('is_active', body.is_active ? 1 : 0);

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ? RETURNING *`;
    params.push(id);

    const updated = await db.prepare(query).bind(...params).first<Product>();
    
    return c.json({
      success: true,
      data: normalizeProductImages(updated!, c.req.url, c.env.R2_PUBLIC_URL),
    });

  } catch (err: any) {
    if (err instanceof ValidationError) {
      return c.json({ success: false, error: err.message }, 400);
    }
    return c.json({ success: false, error: 'Failed to update product' }, 500);
  }
});

adminProductsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;

    // Soft delete: sets is_active = 0 instead of destroying relational records
    const { success } = await db.prepare(`UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(id).run();
    
    if (!success) return c.json({ success: false, error: 'Failed to delete product' }, 500);

    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: 'Internal error during deletion' }, 500);
  }
});
