import { Hono } from 'hono';
import { Env } from '../types';
import { validate } from '../utils/validate';
import { sanitise } from '../utils/sanitise';
import { sendPreorderEmail, sendAdminPreorderNotification, PreorderEmailData } from '../utils/email';

const preorderRouter = new Hono<{ Bindings: Env }>();

// Helper to generate unique reservation ref: PRE18-XXXXXX
function generateReservationRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excluding ambiguous chars (O, 0, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PRE18-${code}`;
}

// =============================================================================
// 1. GET /api/preorder/iphone18
// Return all variants, specs, color options, and pricing
// =============================================================================
preorderRouter.get('/iphone18', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare(`
      SELECT 
        id, model, display_size, storage, color, price_gbp, deposit_amount, 
        stock_status, release_date, image_path
      FROM preorder_products
      ORDER BY 
        CASE WHEN model = 'iPhone 18 Pro' THEN 1 ELSE 2 END,
        price_gbp ASC,
        color ASC
    `).all();

    return c.json({
      success: true,
      data: {
        series: 'iPhone 18 Pro Series',
        chip: 'Apple A20 Pro (2nm)',
        preorderDate: '2026-09-12',
        releaseDate: '2026-09-18',
        depositAmountGbp: 99.00,
        depositPolicy: '100% Refundable prior to dispatch',
        models: [
          {
            name: 'iPhone 18 Pro',
            display: '6.3-inch Super Retina XDR ProMotion',
            startingPrice: 1199.00
          },
          {
            name: 'iPhone 18 Pro Max',
            display: '6.9-inch Super Retina XDR ProMotion',
            startingPrice: 1299.00
          }
        ],
        colors: [
          { name: 'Black', hex: '#2C2C2E', label: 'Space Black' },
          { name: 'Silver', hex: '#E2E4E5', label: 'Natural Silver' },
          { name: 'Glacier', hex: '#C4D8E2', label: 'Glacier Blue' },
          { name: 'Burgundy', hex: '#5B1E31', label: 'Deep Burgundy' }
        ],
        storages: ['256GB', '512GB', '1TB', '2TB'],
        variants: results || []
      }
    });
  } catch (err: any) {
    console.error('Error fetching preorder variants:', err);
    return c.json({ success: false, error: 'Failed to fetch pre-order data' }, 500);
  }
});

// =============================================================================
// 2. POST /api/preorder/reserve
// Place a pre-booking reservation and send confirmation email
// =============================================================================
preorderRouter.post('/reserve', async (c) => {
  try {
    const body = await c.req.json();
    const errors: Record<string, string> = {};

    const customerName = sanitise.string(body.customerName);
    const customerEmail = sanitise.string(body.customerEmail).toLowerCase();
    const customerPhone = sanitise.string(body.customerPhone);
    const model = sanitise.string(body.model);
    const storage = sanitise.string(body.storage);
    const color = sanitise.string(body.color);
    const purchaseType = (body.purchaseType === 'contract' ? 'contract' : 'outright') as 'outright' | 'contract';
    const network = sanitise.string(body.network) || (purchaseType === 'outright' ? 'SIM-Free' : 'EE');
    const contractMonths = Number(body.contractMonths) || 0;
    const marketingOptIn = body.marketingOptIn ? 1 : 0;

    // Validation
    if (!customerName || customerName.length < 2) {
      errors['customerName'] = 'Full name is required (minimum 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || !emailRegex.test(customerEmail)) {
      errors['customerEmail'] = 'A valid email address is required';
    }

    if (!customerPhone || !validate.isValidUKMobile(customerPhone)) {
      errors['customerPhone'] = 'Please enter a valid UK mobile number (e.g. 07123 456789 or +447123456789)';
    }

    if (!model || (model !== 'iPhone 18 Pro' && model !== 'iPhone 18 Pro Max')) {
      errors['model'] = 'Please select a valid model (iPhone 18 Pro or iPhone 18 Pro Max)';
    }

    if (!storage || !['256GB', '512GB', '1TB', '2TB'].includes(storage)) {
      errors['storage'] = 'Please select a valid storage capacity';
    }

    if (!color || !['Black', 'Silver', 'Glacier', 'Burgundy'].includes(color)) {
      errors['color'] = 'Please select a valid color';
    }

    if (Object.keys(errors).length > 0) {
      return c.json({ success: false, errors }, 400);
    }

    // Verify product variant exists and get official price & deposit
    const db = c.env.DB;
    const product = await db.prepare(`
      SELECT id, model, storage, color, price_gbp, deposit_amount, release_date, image_path
      FROM preorder_products
      WHERE model = ? AND storage = ? AND color = ?
    `).bind(model, storage, color).first<{
      id: number;
      model: string;
      storage: string;
      color: string;
      price_gbp: number;
      deposit_amount: number;
      release_date: string;
      image_path: string;
    }>();

    if (!product) {
      return c.json({ success: false, error: 'The selected device configuration was not found' }, 404);
    }

    const reservationId = crypto.randomUUID();
    const reservationRef = generateReservationRef();
    const depositAmount = product.deposit_amount || 99.00;
    const priceGbp = product.price_gbp;

    // Persist into preorder_reservations
    await db.prepare(`
      INSERT INTO preorder_reservations (
        id, reservation_ref, customer_name, customer_email, customer_phone,
        model, storage, color, purchase_type, network, contract_months,
        price_gbp, deposit_amount, deposit_status, status, marketing_opt_in
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', 'CONFIRMED', ?)
    `).bind(
      reservationId,
      reservationRef,
      customerName,
      customerEmail,
      customerPhone,
      model,
      storage,
      color,
      purchaseType,
      network,
      contractMonths,
      priceGbp,
      depositAmount,
      marketingOptIn
    ).run();

    // Prepare email notification data
    const emailData: PreorderEmailData = {
      reservationRef,
      customerName,
      customerEmail,
      customerPhone,
      model,
      storage,
      color,
      purchaseType,
      network,
      priceGbp,
      depositAmount,
      releaseDate: product.release_date || '2026-09-18'
    };

    // Asynchronously dispatch confirmation emails via Resend
    c.executionCtx.waitUntil(
      sendPreorderEmail(c.env, emailData).catch(err => {
        console.error('[preorder] Customer email dispatch error:', err);
      })
    );

    c.executionCtx.waitUntil(
      sendAdminPreorderNotification(c.env, emailData).catch(err => {
        console.error('[preorder] Admin email dispatch error:', err);
      })
    );

    return c.json({
      success: true,
      reservationRef,
      details: {
        id: reservationId,
        reservationRef,
        customerName,
        customerEmail,
        customerPhone,
        model,
        storage,
        color,
        purchaseType,
        network,
        priceGbp,
        depositAmount,
        imagePath: product.image_path,
        releaseDate: product.release_date
      }
    });

  } catch (err: any) {
    console.error('Reservation creation failed:', err);
    return c.json({ success: false, error: 'Internal Server Error while saving reservation' }, 500);
  }
});

// =============================================================================
// 3. GET /api/preorder/reservation/:ref
// Lookup existing reservation status by ref
// =============================================================================
preorderRouter.get('/reservation/:ref', async (c) => {
  try {
    const ref = c.req.param('ref');
    if (!ref) {
      return c.json({ success: false, error: 'Reservation reference is required' }, 400);
    }

    const db = c.env.DB;
    const reservation = await db.prepare(`
      SELECT 
        r.id, r.reservation_ref, r.customer_name, r.customer_email, r.customer_phone,
        r.model, r.storage, r.color, r.purchase_type, r.network, r.contract_months,
        r.price_gbp, r.deposit_amount, r.deposit_status, r.status, r.created_at,
        p.image_path, p.release_date
      FROM preorder_reservations r
      LEFT JOIN preorder_products p ON p.model = r.model AND p.storage = r.storage AND p.color = r.color
      WHERE r.reservation_ref = ?
    `).bind(ref).first();

    if (!reservation) {
      return c.json({ success: false, error: 'Reservation not found' }, 404);
    }

    return c.json({
      success: true,
      data: reservation
    });
  } catch (err: any) {
    console.error('Error fetching reservation:', err);
    return c.json({ success: false, error: 'Failed to retrieve reservation details' }, 500);
  }
});

export default preorderRouter;
