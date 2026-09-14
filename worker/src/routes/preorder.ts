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
// Place a pre-booking reservation with full customer details and send
// confirmation email. Validates identically to the checkout flow.
// =============================================================================
preorderRouter.post('/reserve', async (c) => {
  try {
    const body = await c.req.json();
    const errors: Record<string, string> = {};

    // ── Personal Details ──────────────────────────────────────────────────
    const firstName = sanitise.string(body.firstName);
    const lastName  = sanitise.string(body.lastName);
    const email     = sanitise.string(body.email).toLowerCase();
    const phone     = sanitise.string(body.phone);
    const dob       = sanitise.string(body.dateOfBirth);
    const title     = sanitise.string(body.title) || null;

    if (!firstName || firstName.length < 2) {
      errors['firstName'] = 'First name is required (minimum 2 characters)';
    }
    if (!lastName || lastName.length < 2) {
      errors['lastName'] = 'Last name is required (minimum 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors['email'] = 'A valid email address is required';
    }

    if (!phone || !validate.isValidUKMobile(phone)) {
      errors['phone'] = 'Please enter a valid UK mobile number (e.g. 07123 456789 or +447123456789)';
    }

    // Date of birth — 18+ validation (same as checkout)
    if (!dob) {
      errors['dateOfBirth'] = 'Date of birth is required';
    } else {
      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        errors['dateOfBirth'] = 'Invalid date format';
      } else if (!validate.isAdult(dob)) {
        errors['dateOfBirth'] = 'You must be at least 18 years old';
      }
    }

    if (errors['dateOfBirth'] === 'You must be at least 18 years old') {
      return c.json({
        success: false,
        error: 'AGE_RESTRICTION',
        message: 'You must be at least 18 years old to complete this pre-booking',
        errors
      }, 400);
    }

    // ── Delivery Address ──────────────────────────────────────────────────
    const delivery = body.deliveryAddress || {};
    const deliveryLine1    = sanitise.string(delivery.line1);
    const deliveryLine2    = sanitise.string(delivery.line2) || null;
    const deliveryCity     = sanitise.string(delivery.city);
    const deliveryCounty   = sanitise.string(delivery.county) || null;
    const deliveryPostcode = sanitise.string(delivery.postcode);
    const timeAtAddress    = sanitise.string(body.timeAtAddress) || '1-2 Years';

    if (!deliveryLine1) errors['delivery.line1'] = 'Delivery address line 1 is required';
    if (!deliveryCity)  errors['delivery.city']  = 'Delivery city is required';
    if (!deliveryPostcode) errors['delivery.postcode'] = 'Delivery postcode is required';

    // ── Payment / Direct Debit ────────────────────────────────────────────
    const accountHolderName = sanitise.string(body.accountHolderName);
    const sortCode          = sanitise.string(body.sortCode);
    const accountNumber     = sanitise.string(body.accountNumber);
    const timeWithBank      = sanitise.string(body.timeWithBank) || '1-2 Years';

    if (!accountHolderName) {
      errors['accountHolderName'] = 'Account holder name is required';
    }
    if (!sortCode || !validate.isValidSortCode(sortCode)) {
      errors['sortCode'] = 'Please enter a valid sort code (XX-XX-XX)';
    }
    if (!accountNumber || !validate.isValidAccountNumber(accountNumber)) {
      errors['accountNumber'] = 'Please enter a valid 8-digit account number';
    }

    // ── Insurance ─────────────────────────────────────────────────────────
    const insurancePlan    = ['none', 'lite', 'complete'].includes(body.insurancePlan) ? body.insurancePlan : 'none';
    const insuranceBilling = ['monthly', 'annual'].includes(body.insuranceBilling) ? body.insuranceBilling : 'monthly';

    // ── Variant Selection ─────────────────────────────────────────────────
    const model   = sanitise.string(body.model);
    const storage = sanitise.string(body.storage);
    const color   = sanitise.string(body.color);
    const purchaseType = (body.purchaseType === 'contract' ? 'contract' : 'outright') as 'outright' | 'contract';
    const network = sanitise.string(body.network) || (purchaseType === 'outright' ? 'SIM-Free' : 'EE');
    const contractMonths = Number(body.contractMonths) || 0;
    const marketingOptIn = body.marketingOptIn ? 1 : 0;
    const dealId = body.dealId ? Number(body.dealId) : null;

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
    const customerName = `${firstName} ${lastName}`.trim();

    // Persist into preorder_reservations (all fields including new columns)
    await db.prepare(`
      INSERT INTO preorder_reservations (
        id, reservation_ref, customer_name, customer_email, customer_phone,
        first_name, last_name, date_of_birth, title,
        model, storage, color, purchase_type, network, contract_months,
        delivery_address_line1, delivery_address_line2, delivery_city, delivery_county, delivery_postcode,
        time_at_address,
        account_holder_name, sort_code, account_number, time_with_bank,
        insurance_plan, insurance_billing, deal_id,
        price_gbp, deposit_amount, deposit_status, status, marketing_opt_in
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', 'CONFIRMED', ?)
    `).bind(
      reservationId,
      reservationRef,
      customerName,
      email,
      phone,
      firstName,
      lastName,
      dob,
      title,
      model,
      storage,
      color,
      purchaseType,
      network,
      contractMonths,
      deliveryLine1,
      deliveryLine2,
      deliveryCity,
      deliveryCounty,
      deliveryPostcode,
      timeAtAddress,
      accountHolderName,
      sortCode,
      accountNumber,
      timeWithBank,
      insurancePlan,
      insuranceBilling,
      dealId,
      priceGbp,
      depositAmount,
      marketingOptIn
    ).run();

    // Prepare email notification data
    const emailData: PreorderEmailData = {
      reservationRef,
      customerName,
      customerEmail: email,
      customerPhone: phone,
      model,
      storage,
      color,
      purchaseType,
      network,
      priceGbp,
      depositAmount,
      releaseDate: product.release_date || '2026-09-18',
      deliveryAddress: {
        line1: deliveryLine1,
        line2: deliveryLine2,
        city: deliveryCity,
        county: deliveryCounty,
        postcode: deliveryPostcode,
      },
      insurancePlan,
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
        customerEmail: email,
        customerPhone: phone,
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
        r.first_name, r.last_name, r.date_of_birth, r.title,
        r.model, r.storage, r.color, r.purchase_type, r.network, r.contract_months,
        r.delivery_address_line1, r.delivery_city, r.delivery_postcode, r.time_at_address,
        r.insurance_plan, r.insurance_billing,
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
