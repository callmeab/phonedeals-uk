import { Hono } from 'hono';
import { Env, PreorderProduct, PreorderPriceHistory } from '../types';

export const adminPreorderProductsRouter = new Hono<{ Bindings: Env; Variables: { adminUser: any } }>();

const VALID_STOCK_STATUSES = ['available', 'limited', 'sold_out'] as const;
type ValidStockStatus = typeof VALID_STOCK_STATUSES[number];

/**
 * Helper to get who made the change from JWT context
 */
function getChangedBy(c: any): string {
  const user = c.get('adminUser');
  return user?.email || user?.sub || 'Admin';
}

/**
 * GET /api/admin/preorder-products
 * Returns all 32 iPhone 18 variant rows with full price, deposit, and stock info
 */
adminPreorderProductsRouter.get('/', async (c) => {
  try {
    const model = c.req.query('model');
    const storage = c.req.query('storage');
    const color = c.req.query('color');
    const stockStatus = c.req.query('stock_status');

    const conditions: string[] = ['1=1'];
    const bindings: any[] = [];

    if (model && model !== 'all') {
      conditions.push('model = ?');
      bindings.push(model);
    }
    if (storage && storage !== 'all') {
      conditions.push('storage = ?');
      bindings.push(storage);
    }
    if (color && color !== 'all') {
      conditions.push('color = ?');
      bindings.push(color);
    }
    if (stockStatus && stockStatus !== 'all') {
      conditions.push('stock_status = ?');
      bindings.push(stockStatus);
    }

    const whereSql = conditions.join(' AND ');
    const query = `
      SELECT * FROM preorder_products
      WHERE ${whereSql}
      ORDER BY 
        CASE WHEN model = 'iPhone 18 Pro' THEN 1 ELSE 2 END,
        CASE storage WHEN '256GB' THEN 1 WHEN '512GB' THEN 2 WHEN '1TB' THEN 3 WHEN '2TB' THEN 4 ELSE 5 END,
        color ASC
    `;

    const stmt = bindings.length ? c.env.DB.prepare(query).bind(...bindings) : c.env.DB.prepare(query);
    const result = await stmt.all<PreorderProduct>();

    return c.json({
      success: true,
      data: result.results || [],
      total: result.results?.length ?? 0
    });
  } catch (err: any) {
    console.error('[admin-preorder-products] GET / error:', err);
    return c.json({ success: false, error: 'Failed to fetch preorder products' }, 500);
  }
});

/**
 * GET /api/admin/preorder-products/:id/history
 * Returns audit log of past price and deposit adjustments for a variant
 */
adminPreorderProductsRouter.get('/:id/history', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid product ID' }, 400);
    }

    const query = `
      SELECT h.*, p.model, p.storage, p.color
      FROM preorder_price_history h
      JOIN preorder_products p ON p.id = h.product_id
      WHERE h.product_id = ?
      ORDER BY h.changed_at DESC
    `;

    const result = await c.env.DB.prepare(query).bind(id).all<PreorderPriceHistory>();

    return c.json({
      success: true,
      data: result.results || []
    });
  } catch (err: any) {
    console.error('[admin-preorder-products] GET /:id/history error:', err);
    return c.json({ success: false, error: 'Failed to fetch price history' }, 500);
  }
});

/**
 * PATCH /api/admin/preorder-products/bulk
 * Bulk update multiple variants at once (e.g. flat price bump or batch stock change)
 */
adminPreorderProductsRouter.patch('/bulk', async (c) => {
  try {
    const body = await c.req.json<{
      ids: number[];
      price_gbp?: number;
      adjustment?: number;
      deposit_amount?: number;
      stock_status?: string;
    }>();

    if (!body || !Array.isArray(body.ids) || body.ids.length === 0) {
      return c.json({ success: false, error: 'A non-empty list of variant IDs is required' }, 400);
    }

    const { ids, price_gbp, adjustment, deposit_amount, stock_status } = body;

    if (
      price_gbp === undefined &&
      adjustment === undefined &&
      deposit_amount === undefined &&
      stock_status === undefined
    ) {
      return c.json({ success: false, error: 'No update fields specified (price_gbp, adjustment, deposit_amount, stock_status)' }, 400);
    }

    if (price_gbp !== undefined && (typeof price_gbp !== 'number' || price_gbp <= 0)) {
      return c.json({ success: false, error: 'Price must be a positive number' }, 400);
    }

    if (adjustment !== undefined && typeof adjustment !== 'number') {
      return c.json({ success: false, error: 'Adjustment must be a number' }, 400);
    }

    if (deposit_amount !== undefined && (typeof deposit_amount !== 'number' || deposit_amount < 0)) {
      return c.json({ success: false, error: 'Deposit amount must be a non-negative number' }, 400);
    }

    if (stock_status !== undefined && !VALID_STOCK_STATUSES.includes(stock_status as ValidStockStatus)) {
      return c.json({
        success: false,
        error: `Invalid stock_status. Must be one of: ${VALID_STOCK_STATUSES.join(', ')}`
      }, 400);
    }

    // Fetch existing records for all IDs
    const placeholders = ids.map(() => '?').join(',');
    const existing = await c.env.DB.prepare(
      `SELECT * FROM preorder_products WHERE id IN (${placeholders})`
    ).bind(...ids).all<PreorderProduct>();

    const rows = existing.results || [];
    if (rows.length === 0) {
      return c.json({ success: false, error: 'No matching variants found for provided IDs' }, 404);
    }

    const changedBy = getChangedBy(c);
    const updates: Array<{
      id: number;
      old_price: number;
      new_price: number;
      old_deposit: number;
      new_deposit: number;
      new_stock_status: string;
      priceChanged: boolean;
      depositChanged: boolean;
    }> = [];

    // Pre-validate all calculations
    for (const row of rows) {
      let nextPrice = row.price_gbp;
      if (adjustment !== undefined) {
        nextPrice = Math.round((row.price_gbp + adjustment) * 100) / 100;
      } else if (price_gbp !== undefined) {
        nextPrice = Math.round(price_gbp * 100) / 100;
      }

      if (nextPrice <= 0) {
        return c.json({
          success: false,
          error: `Resulting price for variant ${row.model} (${row.storage} ${row.color}) must be greater than £0`
        }, 400);
      }

      let nextDeposit = row.deposit_amount;
      if (deposit_amount !== undefined) {
        nextDeposit = Math.round(deposit_amount * 100) / 100;
      }

      if (nextDeposit >= nextPrice) {
        return c.json({
          success: false,
          error: `Deposit (£${nextDeposit.toFixed(2)}) must be strictly less than price (£${nextPrice.toFixed(2)}) for ${row.model} (${row.storage} ${row.color})`
        }, 400);
      }

      const nextStockStatus = stock_status !== undefined ? stock_status : row.stock_status;
      const priceChanged = Math.abs(nextPrice - row.price_gbp) > 0.001;
      const depositChanged = Math.abs(nextDeposit - row.deposit_amount) > 0.001;

      updates.push({
        id: row.id,
        old_price: row.price_gbp,
        new_price: nextPrice,
        old_deposit: row.deposit_amount,
        new_deposit: nextDeposit,
        new_stock_status: nextStockStatus,
        priceChanged,
        depositChanged
      });
    }

    // Execute in batch
    const statements: any[] = [];
    for (const u of updates) {
      statements.push(
        c.env.DB.prepare(
          `UPDATE preorder_products 
           SET price_gbp = ?, deposit_amount = ?, stock_status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
           WHERE id = ?`
        ).bind(u.new_price, u.new_deposit, u.new_stock_status, changedBy, u.id)
      );

      if (u.priceChanged || u.depositChanged) {
        statements.push(
          c.env.DB.prepare(
            `INSERT INTO preorder_price_history (product_id, old_price, new_price, old_deposit, new_deposit, changed_by, changed_at)
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
          ).bind(u.id, u.old_price, u.new_price, u.old_deposit, u.new_deposit, changedBy)
        );
      }
    }

    await c.env.DB.batch(statements);

    return c.json({
      success: true,
      message: `Successfully updated ${updates.length} variant${updates.length > 1 ? 's' : ''}`,
      updatedCount: updates.length
    });
  } catch (err: any) {
    console.error('[admin-preorder-products] PATCH /bulk error:', err);
    return c.json({ success: false, error: err.message || 'Failed to bulk update preorder products' }, 500);
  }
});

/**
 * PATCH /api/admin/preorder-products/:id
 * Update price, deposit, and/or stock status for a single variant
 */
adminPreorderProductsRouter.patch('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid product ID' }, 400);
    }

    const body = await c.req.json<{
      price_gbp?: number;
      deposit_amount?: number;
      stock_status?: string;
    }>();

    if (!body) {
      return c.json({ success: false, error: 'Request body cannot be empty' }, 400);
    }

    const existing = await c.env.DB.prepare(
      'SELECT * FROM preorder_products WHERE id = ?'
    ).bind(id).first<PreorderProduct>();

    if (!existing) {
      return c.json({ success: false, error: 'Preorder product variant not found' }, 404);
    }

    let nextPrice = existing.price_gbp;
    let priceChanged = false;
    if (body.price_gbp !== undefined) {
      if (typeof body.price_gbp !== 'number' || isNaN(body.price_gbp) || body.price_gbp <= 0) {
        return c.json({ success: false, error: 'Price must be a positive number greater than £0' }, 400);
      }
      nextPrice = Math.round(body.price_gbp * 100) / 100;
      priceChanged = Math.abs(nextPrice - existing.price_gbp) > 0.001;
    }

    let nextDeposit = existing.deposit_amount;
    let depositChanged = false;
    if (body.deposit_amount !== undefined) {
      if (typeof body.deposit_amount !== 'number' || isNaN(body.deposit_amount) || body.deposit_amount < 0) {
        return c.json({ success: false, error: 'Deposit amount must be a non-negative number' }, 400);
      }
      nextDeposit = Math.round(body.deposit_amount * 100) / 100;
      depositChanged = Math.abs(nextDeposit - existing.deposit_amount) > 0.001;
    }

    // Validate deposit < price
    if (nextDeposit >= nextPrice) {
      return c.json({
        success: false,
        error: `Deposit amount (£${nextDeposit.toFixed(2)}) must be strictly less than product price (£${nextPrice.toFixed(2)})`
      }, 400);
    }

    let nextStockStatus = existing.stock_status;
    if (body.stock_status !== undefined) {
      if (!VALID_STOCK_STATUSES.includes(body.stock_status as ValidStockStatus)) {
        return c.json({
          success: false,
          error: `Invalid stock_status. Must be one of: ${VALID_STOCK_STATUSES.join(', ')}`
        }, 400);
      }
      nextStockStatus = body.stock_status as ValidStockStatus;
    }

    const statusChanged = nextStockStatus !== existing.stock_status;

    if (!priceChanged && !depositChanged && !statusChanged) {
      return c.json({
        success: true,
        message: 'No changes were detected',
        data: existing
      });
    }

    const changedBy = getChangedBy(c);

    // Run batch update: Update row + record history if price or deposit changed
    const statements = [
      c.env.DB.prepare(
        `UPDATE preorder_products 
         SET price_gbp = ?, deposit_amount = ?, stock_status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
         WHERE id = ?`
      ).bind(nextPrice, nextDeposit, nextStockStatus, changedBy, id)
    ];

    if (priceChanged || depositChanged) {
      statements.push(
        c.env.DB.prepare(
          `INSERT INTO preorder_price_history (product_id, old_price, new_price, old_deposit, new_deposit, changed_by, changed_at)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).bind(id, existing.price_gbp, nextPrice, existing.deposit_amount, nextDeposit, changedBy)
      );
    }

    await c.env.DB.batch(statements);

    const updated = await c.env.DB.prepare(
      'SELECT * FROM preorder_products WHERE id = ?'
    ).bind(id).first<PreorderProduct>();

    return c.json({
      success: true,
      message: `Variant ${updated?.model} (${updated?.storage} ${updated?.color}) updated successfully`,
      data: updated
    });
  } catch (err: any) {
    console.error('[admin-preorder-products] PATCH /:id error:', err);
    return c.json({ success: false, error: err.message || 'Failed to update preorder product' }, 500);
  }
});
