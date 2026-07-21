import { Hono } from 'hono';
import { Env } from '../types';
import { sendOrderEmail, OrderEmailData, OrderEmailType } from '../utils/email';

const ordersRouter = new Hono<{ Bindings: Env }>();

// Valid order statuses and which ones trigger a shipping email
const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] as const;
type OrderStatus = typeof VALID_STATUSES[number];

// Map from DB status → email type (only statuses that send an email are listed)
const STATUS_EMAIL_MAP: Partial<Record<OrderStatus, OrderEmailType>> = {
  SHIPPED:          'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED:        'delivered',
};

// GET /api/admin/orders — list all orders with customer and deal info
ordersRouter.get('/', async (c) => {
  try {
    const page  = parseInt(c.req.query('page')  || '1', 10);
    const limit = parseInt(c.req.query('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const rows = await c.env.DB.prepare(`
      SELECT
        o.id,
        o.status,
        o.network_provider,
        o.delivery_address_line1,
        o.delivery_city,
        o.delivery_postcode,
        o.created_at,
        c.first_name,
        c.last_name,
        c.email,
        p.name AS product_name,
        d.monthly_cost,
        d.upfront_cost,
        d.contract_months
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      JOIN deals     d ON d.id = o.deal_id
      LEFT JOIN products p ON p.id = d.product_id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    const totalRow = await c.env.DB.prepare('SELECT COUNT(*) AS total FROM orders').first<{ total: number }>();

    return c.json({
      success: true,
      data:  rows.results,
      total: totalRow?.total ?? 0,
      page,
      limit,
    });
  } catch (err: any) {
    console.error('[orders] GET / error:', err);
    return c.json({ success: false, error: 'Failed to fetch orders' }, 500);
  }
});

// GET /api/admin/orders/:id — single order detail
ordersRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const order = await c.env.DB.prepare(`
      SELECT
        o.*,
        c.first_name, c.last_name, c.email, c.phone,
        p.name AS product_name,
        d.network, d.monthly_cost, d.upfront_cost, d.contract_months
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      JOIN deals     d ON d.id = o.deal_id
      LEFT JOIN products p ON p.id = d.product_id
      WHERE o.id = ?
    `).bind(id).first();

    if (!order) {
      return c.json({ success: false, error: 'Order not found' }, 404);
    }

    return c.json({ success: true, data: order });
  } catch (err: any) {
    console.error('[orders] GET /:id error:', err);
    return c.json({ success: false, error: 'Failed to fetch order' }, 500);
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Body: { status: OrderStatus }
 *
 * Updates the order status in the DB and, if the new status has an associated
 * email type (SHIPPED / OUT_FOR_DELIVERY / DELIVERED), sends a shipping update
 * email to the customer. Email failure does NOT prevent the status update.
 */
ordersRouter.patch('/:id/status', async (c) => {
  try {
    const orderId = c.req.param('id');
    const body    = await c.req.json<{ status: string }>();
    const newStatus = body?.status?.toUpperCase() as OrderStatus | undefined;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return c.json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      }, 400);
    }

    // Fetch existing order + customer + deal for email data
    const orderRow = await c.env.DB.prepare(`
      SELECT
        o.id AS order_id,
        o.status AS current_status,
        o.delivery_address_line1,
        o.delivery_address_line2,
        o.delivery_city,
        o.delivery_county,
        o.delivery_postcode,
        c.first_name, c.last_name, c.email,
        p.name AS product_name,
        d.network, d.monthly_cost, d.upfront_cost, d.contract_months
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      JOIN deals     d ON d.id = o.deal_id
      LEFT JOIN products p ON p.id = d.product_id
      WHERE o.id = ?
    `).bind(orderId).first<{
      order_id: string;
      current_status: string;
      delivery_address_line1: string;
      delivery_address_line2?: string | null;
      delivery_city: string;
      delivery_county?: string | null;
      delivery_postcode: string;
      first_name: string;
      last_name: string;
      email: string;
      product_name?: string;
      network: string;
      monthly_cost: number;
      upfront_cost: number;
      contract_months: number;
    }>();

    if (!orderRow) {
      return c.json({ success: false, error: 'Order not found' }, 404);
    }

    // Update the status in DB
    await c.env.DB.prepare(
      `UPDATE orders SET status = ? WHERE id = ?`
    ).bind(newStatus, orderId).run();

    // Send shipping update email if applicable (non-blocking)
    const emailType = STATUS_EMAIL_MAP[newStatus];
    if (emailType && orderRow.email) {
      const emailData: OrderEmailData = {
        orderId,
        customerName:   `${orderRow.first_name} ${orderRow.last_name}`.trim(),
        customerEmail:  orderRow.email,
        productName:    orderRow.product_name || 'Smartphone',
        network:        orderRow.network,
        contractMonths: orderRow.contract_months,
        monthlyAmount:  orderRow.monthly_cost,
        upfrontAmount:  orderRow.upfront_cost,
        deliveryAddress: {
          line1:    orderRow.delivery_address_line1,
          line2:    orderRow.delivery_address_line2  || null,
          city:     orderRow.delivery_city,
          county:   orderRow.delivery_county         || null,
          postcode: orderRow.delivery_postcode,
        },
      };
      c.executionCtx.waitUntil(
        sendOrderEmail(emailType, c.env, emailData).catch((err) => {
          console.error(`[orders] Failed to send ${emailType} email:`, err);
        })
      );
    }

    return c.json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      emailTriggered: !!emailType,
    });
  } catch (err: any) {
    console.error('[orders] PATCH /:id/status error:', err);
    return c.json({ success: false, error: 'Failed to update order status' }, 500);
  }
});

export default ordersRouter;
