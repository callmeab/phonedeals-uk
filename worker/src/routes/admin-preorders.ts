import { Hono } from 'hono';
import { Env } from '../types';

export const adminPreordersRouter = new Hono<{ Bindings: Env }>();

export const ALLOWED_STATUSES = [
  'new',
  'confirmed',
  'ready_for_collection',
  'completed',
  'cancelled'
] as const;

export type PreorderStatus = typeof ALLOWED_STATUSES[number];

function normalizeStatus(status: string): PreorderStatus | null {
  const s = status.toLowerCase().trim();
  if ((ALLOWED_STATUSES as readonly string[]).includes(s)) {
    return s as PreorderStatus;
  }
  return null;
}

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * GET /api/admin/preorders/stats
 * Summary metrics for dashboard cards
 */
adminPreordersRouter.get('/stats', async (c) => {
  try {
    const totalRow = await c.env.DB.prepare(
      'SELECT COUNT(*) AS total, COALESCE(SUM(deposit_amount), 0) AS total_deposits FROM preorder_reservations WHERE status != "cancelled"'
    ).first<{ total: number; total_deposits: number }>();

    const totalAllRow = await c.env.DB.prepare(
      'SELECT COUNT(*) AS total_all FROM preorder_reservations'
    ).first<{ total_all: number }>();

    const byModelRows = await c.env.DB.prepare(
      'SELECT model, COUNT(*) AS count FROM preorder_reservations GROUP BY model'
    ).all<{ model: string; count: number }>();

    const byColorRows = await c.env.DB.prepare(
      'SELECT color, COUNT(*) AS count FROM preorder_reservations GROUP BY color ORDER BY count DESC'
    ).all<{ color: string; count: number }>();

    const byStorageRows = await c.env.DB.prepare(
      'SELECT storage, COUNT(*) AS count FROM preorder_reservations GROUP BY storage ORDER BY count DESC'
    ).all<{ storage: string; count: number }>();

    const byStatusRows = await c.env.DB.prepare(
      'SELECT status, COUNT(*) AS count FROM preorder_reservations GROUP BY status'
    ).all<{ status: string; count: number }>();

    const byModel: Record<string, number> = {};
    for (const r of byModelRows.results || []) {
      byModel[r.model] = r.count;
    }

    const byColor: Record<string, number> = {};
    for (const r of byColorRows.results || []) {
      byColor[r.color] = r.count;
    }

    const byStorage: Record<string, number> = {};
    for (const r of byStorageRows.results || []) {
      byStorage[r.storage] = r.count;
    }

    const byStatus: Record<string, number> = {};
    for (const r of byStatusRows.results || []) {
      byStatus[r.status.toLowerCase()] = r.count;
    }

    const mostPopularModel = byModelRows.results?.length
      ? [...byModelRows.results].sort((a, b) => b.count - a.count)[0].model
      : 'N/A';

    const mostPopularColor = byColorRows.results?.length ? byColorRows.results[0].color : 'N/A';
    const mostPopularStorage = byStorageRows.results?.length ? byStorageRows.results[0].storage : 'N/A';

    return c.json({
      success: true,
      data: {
        totalBookings: totalAllRow?.total_all ?? 0,
        activeBookings: totalRow?.total ?? 0,
        totalDeposits: totalRow?.total_deposits ?? 0,
        mostPopularModel,
        mostPopularColor,
        mostPopularStorage,
        byModel,
        byColor,
        byStorage,
        byStatus
      }
    });
  } catch (err: any) {
    console.error('[admin-preorders] GET /stats error:', err);
    return c.json({ success: false, error: 'Failed to calculate preorder statistics' }, 500);
  }
});

/**
 * GET /api/admin/preorders/export
 * Downloads RFC-4180 compliant CSV of filtered reservations
 */
adminPreordersRouter.get('/export', async (c) => {
  try {
    const status = c.req.query('status');
    const model = c.req.query('model');
    const color = c.req.query('color');
    const search = c.req.query('search');
    const dateFrom = c.req.query('dateFrom');
    const dateTo = c.req.query('dateTo');

    const conditions: string[] = ['1=1'];
    const bindings: any[] = [];

    if (status && status !== 'all') {
      conditions.push('LOWER(r.status) = LOWER(?)');
      bindings.push(status);
    }
    if (model && model !== 'all') {
      conditions.push('r.model = ?');
      bindings.push(model);
    }
    if (color && color !== 'all') {
      conditions.push('r.color = ?');
      bindings.push(color);
    }
    if (dateFrom) {
      conditions.push('r.created_at >= ?');
      bindings.push(dateFrom);
    }
    if (dateTo) {
      conditions.push('r.created_at <= ?');
      bindings.push(dateTo + ' 23:59:59');
    }
    if (search && search.trim()) {
      const s = '%' + search.trim().toLowerCase() + '%';
      conditions.push('(LOWER(r.reservation_ref) LIKE ? OR LOWER(r.customer_name) LIKE ? OR LOWER(r.customer_email) LIKE ? OR r.customer_phone LIKE ?)');
      bindings.push(s, s, s, s);
    }

    const whereClause = conditions.join(' AND ');
    const query = 'SELECT r.reservation_ref, r.customer_name, r.customer_email, r.customer_phone, r.model, r.color, r.storage, r.price_gbp, r.deposit_amount, r.deposit_status, r.status, r.purchase_type, r.network, r.created_at FROM preorder_reservations r WHERE ' + whereClause + ' ORDER BY r.created_at DESC';

    const stmt = bindings.length ? c.env.DB.prepare(query).bind(...bindings) : c.env.DB.prepare(query);
    const result = await stmt.all<any>();
    const rows = result.results || [];

    const headers = [
      'Reference',
      'Customer Name',
      'Email',
      'Phone',
      'Model',
      'Color',
      'Storage',
      'Price GBP',
      'Deposit GBP',
      'Deposit Status',
      'Status',
      'Purchase Type',
      'Network',
      'Booking Date'
    ];

    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const line = [
        escapeCsvField(r.reservation_ref),
        escapeCsvField(r.customer_name),
        escapeCsvField(r.customer_email),
        escapeCsvField(r.customer_phone),
        escapeCsvField(r.model),
        escapeCsvField(r.color),
        escapeCsvField(r.storage),
        escapeCsvField(r.price_gbp?.toFixed(2) ?? '0.00'),
        escapeCsvField(r.deposit_amount?.toFixed(2) ?? '99.00'),
        escapeCsvField(r.deposit_status),
        escapeCsvField(r.status),
        escapeCsvField(r.purchase_type),
        escapeCsvField(r.network || 'SIM-Free'),
        escapeCsvField(r.created_at)
      ].join(',');
      csvLines.push(line);
    }

    const csvContent = csvLines.join('\r\n');
    const today = new Date().toISOString().split('T')[0];
    const filename = 'iphone18-bookings-' + today + '.csv';

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="' + filename + '"',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err: any) {
    console.error('[admin-preorders] GET /export error:', err);
    return c.json({ success: false, error: 'Failed to export preorders' }, 500);
  }
});

/**
 * GET /api/admin/preorders
 * Paginated list of reservations with filters
 */
adminPreordersRouter.get('/', async (c) => {
  try {
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const status = c.req.query('status');
    const model = c.req.query('model');
    const color = c.req.query('color');
    const storage = c.req.query('storage');
    const search = c.req.query('search');
    const dateFrom = c.req.query('dateFrom');
    const dateTo = c.req.query('dateTo');

    const conditions: string[] = ['1=1'];
    const bindings: any[] = [];

    if (status && status !== 'all') {
      conditions.push('LOWER(r.status) = LOWER(?)');
      bindings.push(status);
    }
    if (model && model !== 'all') {
      conditions.push('r.model = ?');
      bindings.push(model);
    }
    if (color && color !== 'all') {
      conditions.push('r.color = ?');
      bindings.push(color);
    }
    if (storage && storage !== 'all') {
      conditions.push('r.storage = ?');
      bindings.push(storage);
    }
    if (dateFrom) {
      conditions.push('r.created_at >= ?');
      bindings.push(dateFrom);
    }
    if (dateTo) {
      conditions.push('r.created_at <= ?');
      bindings.push(dateTo + ' 23:59:59');
    }
    if (search && search.trim()) {
      const s = '%' + search.trim().toLowerCase() + '%';
      conditions.push('(LOWER(r.reservation_ref) LIKE ? OR LOWER(r.customer_name) LIKE ? OR LOWER(r.customer_email) LIKE ? OR r.customer_phone LIKE ?)');
      bindings.push(s, s, s, s);
    }

    const whereClause = conditions.join(' AND ');

    // 1. Total count
    const countSql = 'SELECT COUNT(*) AS total FROM preorder_reservations r WHERE ' + whereClause;
    const countStmt = bindings.length ? c.env.DB.prepare(countSql).bind(...bindings) : c.env.DB.prepare(countSql);
    const countRow = await countStmt.first<{ total: number }>();
    const total = countRow?.total ?? 0;

    // 2. Data rows joined with product image
    const dataSql = 'SELECT r.id, r.reservation_ref, r.customer_name, r.customer_email, r.customer_phone, r.first_name, r.last_name, r.model, r.storage, r.color, r.purchase_type, r.network, r.contract_months, r.price_gbp, r.deposit_amount, r.deposit_status, r.status, r.marketing_opt_in, r.created_at, r.updated_at, r.insurance_plan, r.deal_id, p.image_path, p.display_size FROM preorder_reservations r LEFT JOIN preorder_products p ON p.model = r.model AND p.storage = r.storage AND p.color = r.color WHERE ' + whereClause + ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';

    const dataBindings = [...bindings, limit, offset];
    const dataStmt = c.env.DB.prepare(dataSql).bind(...dataBindings);
    const result = await dataStmt.all<any>();

    return c.json({
      success: true,
      data: result.results || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err: any) {
    console.error('[admin-preorders] GET / error:', err);
    return c.json({ success: false, error: 'Failed to fetch preorders' }, 500);
  }
});

/**
 * GET /api/admin/preorders/:id
 * Retrieve single reservation detail
 */
adminPreordersRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const row = await c.env.DB.prepare(
      'SELECT r.*, p.image_path, p.display_size, p.release_date FROM preorder_reservations r LEFT JOIN preorder_products p ON p.model = r.model AND p.storage = r.storage AND p.color = r.color WHERE r.id = ? OR r.reservation_ref = ?'
    ).bind(id, id).first<any>();

    if (!row) {
      return c.json({ success: false, error: 'Reservation not found' }, 404);
    }

    return c.json({ success: true, data: row });
  } catch (err: any) {
    console.error('[admin-preorders] GET /:id error:', err);
    return c.json({ success: false, error: 'Failed to fetch reservation' }, 500);
  }
});

/**
 * PATCH /api/admin/preorders/:id
 * Update status (new | confirmed | ready_for_collection | completed | cancelled)
 */
adminPreordersRouter.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json<{ status?: string }>();

    if (!body?.status) {
      return c.json({ success: false, error: 'Missing status field' }, 400);
    }

    const normalized = normalizeStatus(body.status);
    if (!normalized) {
      return c.json({
        success: false,
        error: 'Invalid status. Must be one of: ' + ALLOWED_STATUSES.join(', ')
      }, 400);
    }

    // Verify reservation exists
    const existing = await c.env.DB.prepare(
      'SELECT id, reservation_ref, status FROM preorder_reservations WHERE id = ? OR reservation_ref = ?'
    ).bind(id, id).first<{ id: string; reservation_ref: string; status: string }>();

    if (!existing) {
      return c.json({ success: false, error: 'Reservation not found' }, 404);
    }

    const now = new Date().toISOString();
    await c.env.DB.prepare(
      'UPDATE preorder_reservations SET status = ?, updated_at = ? WHERE id = ?'
    ).bind(normalized, now, existing.id).run();

    const updated = await c.env.DB.prepare(
      'SELECT r.*, p.image_path, p.display_size FROM preorder_reservations r LEFT JOIN preorder_products p ON p.model = r.model AND p.storage = r.storage AND p.color = r.color WHERE r.id = ?'
    ).bind(existing.id).first<any>();

    return c.json({
      success: true,
      message: 'Reservation ' + existing.reservation_ref + ' updated to ' + normalized,
      data: updated
    });
  } catch (err: any) {
    console.error('[admin-preorders] PATCH /:id error:', err);
    return c.json({ success: false, error: 'Failed to update reservation status' }, 500);
  }
});
