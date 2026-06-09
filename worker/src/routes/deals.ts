import { Hono } from 'hono';
import { Env, Deal } from '../types';
import { validate, ValidationError } from '../utils/validate';

export const publicDealsRouter = new Hono<{ Bindings: Env }>();
export const adminDealsRouter = new Hono<{ Bindings: Env }>();

const NETWORKS = ['EE', 'O2', 'Vodafone', 'Three', 'Sky Mobile', 'iD Mobile', 'BT Mobile'];
const CONTRACTS = [12, 24, 36];

// --- PUBLIC ROUTES ---
publicDealsRouter.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const url = new URL(c.req.url);
    const productId = url.searchParams.get('product_id');

    if (!productId) {
      return c.json({ success: false, error: 'product_id query param is required' }, 400);
    }

    const { results } = await db.prepare(`
      SELECT d.*, p.name as product_name
      FROM deals d
      JOIN products p ON d.product_id = p.id
      WHERE d.product_id = ? AND d.is_active = 1
      ORDER BY d.monthly_cost ASC
    `).bind(productId).all<Deal>();

    return c.json({ success: true, data: results });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to fetch public deals' }, 500);
  }
});

// --- PROTECTED ADMIN ROUTES ---
adminDealsRouter.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const url = new URL(c.req.url);
    const productId = url.searchParams.get('product_id');

    if (!productId) {
      return c.json({ success: false, error: 'product_id query param is required' }, 400);
    }

    const { results } = await db.prepare(`
      SELECT d.*, p.name as product_name
      FROM deals d
      JOIN products p ON d.product_id = p.id
      WHERE d.product_id = ?
      ORDER BY d.sort_order ASC, d.monthly_cost ASC
    `).bind(productId).all<Deal>();

    return c.json({ success: true, data: results });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to fetch admin deals' }, 500);
  }
});

adminDealsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json<any>();
    const db = c.env.DB;

    validate.required(body.product_id, 'Product ID');
    validate.required(body.network, 'Network');
    if (!NETWORKS.includes(body.network)) throw new ValidationError(`Invalid network. Must be one of: ${NETWORKS.join(', ')}`);
    
    validate.required(body.contract_months, 'Contract Months');
    if (!CONTRACTS.includes(Number(body.contract_months))) throw new ValidationError('Invalid contract_months. Must be 12, 24, or 36');

    validate.required(body.monthly_cost, 'Monthly Cost');
    if (Number(body.monthly_cost) <= 0) throw new ValidationError('Monthly cost must be > 0');

    validate.required(body.data_gb, 'Data GB');
    
    const minutes = body.minutes !== undefined ? Number(body.minutes) : 9999;
    const texts = body.texts !== undefined ? Number(body.texts) : 9999;
    const upfront = body.upfront_cost ? Number(body.upfront_cost) : 0;
    
    let highlights = null;
    if (body.deal_highlights && Array.isArray(body.deal_highlights)) {
      if (body.deal_highlights.length > 4) throw new ValidationError('Max 4 deal highlights allowed');
      highlights = JSON.stringify(body.deal_highlights);
    }

    const result = await db.prepare(`
      INSERT INTO deals (
        product_id, network, contract_months, monthly_cost, upfront_cost, 
        data_gb, minutes, texts, deal_highlights, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      body.product_id,
      body.network,
      body.contract_months,
      body.monthly_cost,
      upfront,
      body.data_gb,
      minutes,
      texts,
      highlights,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
      body.sort_order || 0
    ).first<Deal>();

    return c.json({ success: true, data: result }, 201);
  } catch (err: any) {
    if (err instanceof ValidationError) return c.json({ success: false, error: err.message }, 400);
    return c.json({ success: false, error: 'Failed to create deal' }, 500);
  }
});

adminDealsRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json<any>();
    const db = c.env.DB;

    const current = await db.prepare('SELECT * FROM deals WHERE id = ?').bind(id).first<Deal>();
    if (!current) return c.json({ success: false, error: 'Deal not found' }, 404);

    const updates: string[] = [];
    const params: any[] = [];

    const addUpdate = (field: string, val: any) => {
      updates.push(`${field} = ?`);
      params.push(val);
    };

    if (body.product_id !== undefined) addUpdate('product_id', body.product_id);
    if (body.network !== undefined) {
      if (!NETWORKS.includes(body.network)) throw new ValidationError('Invalid network');
      addUpdate('network', body.network);
    }
    if (body.contract_months !== undefined) {
      if (!CONTRACTS.includes(Number(body.contract_months))) throw new ValidationError('Invalid contract_months');
      addUpdate('contract_months', body.contract_months);
    }
    if (body.monthly_cost !== undefined) {
      if (Number(body.monthly_cost) <= 0) throw new ValidationError('Monthly cost must be > 0');
      addUpdate('monthly_cost', body.monthly_cost);
    }
    if (body.upfront_cost !== undefined) addUpdate('upfront_cost', body.upfront_cost);
    if (body.data_gb !== undefined) addUpdate('data_gb', body.data_gb);
    if (body.minutes !== undefined) addUpdate('minutes', body.minutes);
    if (body.texts !== undefined) addUpdate('texts', body.texts);
    
    if (body.deal_highlights !== undefined) {
      if (Array.isArray(body.deal_highlights) && body.deal_highlights.length > 4) {
        throw new ValidationError('Max 4 deal highlights allowed');
      }
      addUpdate('deal_highlights', Array.isArray(body.deal_highlights) ? JSON.stringify(body.deal_highlights) : null);
    }
    
    if (body.is_active !== undefined) addUpdate('is_active', body.is_active ? 1 : 0);
    if (body.sort_order !== undefined) addUpdate('sort_order', body.sort_order);

    if (updates.length === 0) return c.json({ success: true, data: current });

    const query = `UPDATE deals SET ${updates.join(', ')} WHERE id = ? RETURNING *`;
    params.push(id);

    const updated = await db.prepare(query).bind(...params).first<Deal>();
    
    return c.json({ success: true, data: updated });
  } catch (err: any) {
    if (err instanceof ValidationError) return c.json({ success: false, error: err.message }, 400);
    return c.json({ success: false, error: 'Failed to update deal' }, 500);
  }
});

adminDealsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = c.env.DB;

    // Deals are transient representations of third-party network prices. Hard delete is preferred.
    const { success } = await db.prepare(`DELETE FROM deals WHERE id = ?`).bind(id).run();
    if (!success) return c.json({ success: false, error: 'Failed to delete deal' }, 500);

    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: 'Internal error during deletion' }, 500);
  }
});

adminDealsRouter.post('/bulk-toggle', async (c) => {
  try {
    const body = await c.req.json<{ ids: number[], is_active: boolean }>();
    const db = c.env.DB;

    validate.required(body.ids, 'Deal IDs array');
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return c.json({ success: false, error: 'Empty or invalid IDs array' }, 400);
    }

    const isActiveVal = body.is_active ? 1 : 0;
    
    // Process a D1 Batch transaction to efficiently update all rows natively
    const stmts = body.ids.map(id => db.prepare('UPDATE deals SET is_active = ? WHERE id = ?').bind(isActiveVal, id));
    await db.batch(stmts);

    return c.json({ success: true, updated: body.ids.length });
  } catch (err: any) {
    return c.json({ success: false, error: 'Failed to bulk toggle deals' }, 500);
  }
});
