import { Hono } from 'hono';
import { Env, Category } from '../types';
import { validate, ValidationError } from '../utils/validate';

// ---------------------------------------------------------------------------
// PRE-SEED NOTE:
// The D1 seed script (worker/src/db/seed.sql) already inserts the two
// categories this site requires:
//   INSERT INTO categories (name, slug, display_order, is_active) VALUES
//     ('Apple iPhone', 'iphone', 1, 1),
//     ('Samsung Galaxy', 'samsung', 2, 1);
//
// Categories rarely change. These endpoints exist for flexibility and admin
// transparency — not because the data is expected to evolve frequently.
// ---------------------------------------------------------------------------

export const publicCategoriesRouter = new Hono<{ Bindings: Env }>();
export const adminCategoriesRouter = new Hono<{ Bindings: Env }>();

// --- PUBLIC ---
// GET /api/categories
// Returns all active categories, ordered by display_order ASC
publicCategoriesRouter.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, name, slug, display_order
      FROM categories
      WHERE is_active = 1
      ORDER BY display_order ASC
    `).all<Pick<Category, 'id' | 'name' | 'slug' | 'display_order'>>();

    return c.json({ success: true, data: results });
  } catch (err) {
    console.error('GET /api/categories error:', err);
    return c.json({ success: false, error: 'Failed to fetch categories' }, 500);
  }
});

// --- PROTECTED ADMIN ---
// GET /api/admin/categories
// Returns all categories including inactive ones
adminCategoriesRouter.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, name, slug, display_order, is_active
      FROM categories
      ORDER BY display_order ASC
    `).all<Category>();

    return c.json({ success: true, data: results });
  } catch (err) {
    console.error('GET /api/admin/categories error:', err);
    return c.json({ success: false, error: 'Failed to fetch categories' }, 500);
  }
});

// POST /api/admin/categories
// Creates a new category. Slug must be unique.
adminCategoriesRouter.post('/', async (c) => {
  try {
    const body = await c.req.json<any>();

    validate.required(body.name, 'Name');
    validate.required(body.slug, 'Slug');

    // Enforce slug format: lowercase alphanumeric + hyphens only
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
      throw new ValidationError('Slug must be lowercase alphanumeric with hyphens only (e.g. "apple-iphone")');
    }

    // Check slug uniqueness
    const existing = await c.env.DB.prepare(
      'SELECT id FROM categories WHERE slug = ?'
    ).bind(body.slug).first();

    if (existing) {
      return c.json({ success: false, error: `Slug "${body.slug}" is already in use` }, 409);
    }

    const displayOrder = body.display_order ? Number(body.display_order) : 99;

    const result = await c.env.DB.prepare(`
      INSERT INTO categories (name, slug, display_order, is_active)
      VALUES (?, ?, ?, 1)
      RETURNING *
    `).bind(body.name, body.slug, displayOrder).first<Category>();

    return c.json({ success: true, data: result }, 201);
  } catch (err: any) {
    if (err instanceof ValidationError) return c.json({ success: false, error: err.message }, 400);
    console.error('POST /api/admin/categories error:', err);
    return c.json({ success: false, error: 'Failed to create category' }, 500);
  }
});

// PUT /api/admin/categories/:id
// Partial update: name, display_order, is_active
adminCategoriesRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json<any>();

    const current = await c.env.DB.prepare(
      'SELECT * FROM categories WHERE id = ?'
    ).bind(id).first<Category>();

    if (!current) return c.json({ success: false, error: 'Category not found' }, 404);

    const updates: string[] = [];
    const params: any[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      params.push(body.name);
    }
    if (body.display_order !== undefined) {
      updates.push('display_order = ?');
      params.push(Number(body.display_order));
    }
    if (body.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(body.is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return c.json({ success: true, data: current });
    }

    const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = ? RETURNING *`;
    params.push(id);

    const updated = await c.env.DB.prepare(query).bind(...params).first<Category>();
    return c.json({ success: true, data: updated });
  } catch (err) {
    console.error('PUT /api/admin/categories/:id error:', err);
    return c.json({ success: false, error: 'Failed to update category' }, 500);
  }
});
