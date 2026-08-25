import { Hono } from 'hono';
import { Env } from '../types';
import { validate } from '../utils/validate';
import { sanitise } from '../utils/sanitise';
import { sendOrderEmail, OrderEmailData } from '../utils/email';

const checkoutRouter = new Hono<{ Bindings: Env }>();

// GET /api/checkout/postcode-lookup
checkoutRouter.get('/postcode-lookup', async (c) => {
  const postcode = c.req.query('postcode');

  if (!postcode) {
    return c.json({ success: false, error: 'Postcode is required' }, 400);
  }

  // TODO: integrate getaddress.io (free tier: 20 lookups/day) or ideal-postcodes.co.uk (pay-as-you-go, ~1p per lookup) for production

  // Hardcoded mock response for UI testing
  return c.json({
    success: true,
    data: {
      addresses: [
        { line1: "10 Downing Street", city: "London", county: "Greater London" },
        { line1: "11 Downing Street", city: "London", county: "Greater London" },
        { line1: "Flat 1, 12 Downing Street", city: "London", county: "Greater London" }
      ]
    }
  });
});

// POST /api/checkout/create-intent
checkoutRouter.post('/create-intent', async (c) => {
  try {
    const body = await c.req.json();
    const errors: Record<string, string> = {};

    // 1 & 2: Date of Birth
    if (!body.customer?.dateOfBirth) {
      errors['dateOfBirth'] = 'Date of birth is required';
    } else {
      const dobDate = new Date(body.customer.dateOfBirth);
      if (isNaN(dobDate.getTime())) {
        errors['dateOfBirth'] = 'Invalid date format';
      } else if (!validate.isAdult(body.customer.dateOfBirth)) {
        errors['dateOfBirth'] = 'You must be at least 18 years old';
      }
    }

    // Return 400 early with special error struct if age restriction fails,
    // but the prompt says returns field-level errors as well.
    if (errors['dateOfBirth'] === 'You must be at least 18 years old') {
      return c.json({
        success: false,
        error: 'AGE_RESTRICTION',
        message: 'You must be at least 18 years old to complete this order',
        errors
      }, 400);
    }

    // 3. Mobile validation
    if (!body.customer?.mobile || !validate.isValidUKMobile(body.customer.mobile)) {
      errors['mobile'] = 'Please enter a valid UK mobile number';
    }

    // 4. Delivery address
    const delivery = body.deliveryAddress || {};
    if (!sanitise.string(delivery.line1)) errors['delivery.line1'] = 'Delivery address line 1 is required';
    if (!sanitise.string(delivery.city)) errors['delivery.city'] = 'Delivery city is required';
    if (!sanitise.string(delivery.postcode)) errors['delivery.postcode'] = 'Delivery postcode is required';

    // 5. Billing address
    if (!body.sameAsDelivery) {
      const billing = body.billingAddress || {};
      if (!sanitise.string(billing.line1)) errors['billing.line1'] = 'Billing address line 1 is required';
      if (!sanitise.string(billing.city)) errors['billing.city'] = 'Billing city is required';
      if (!sanitise.string(billing.postcode)) errors['billing.postcode'] = 'Billing postcode is required';
    }

    // 6. Title validation
    if (body.customer?.title && !['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Other'].includes(body.customer.title)) {
      errors['title'] = 'Invalid title selected';
    }

    // 7. Network provider validation — also fetch deal+product info for the confirmation email
    let dealInfo: {
      network: string;
      monthly_cost: number;
      upfront_cost: number;
      contract_months: number;
      product_name?: string;
    } | null = null;

    if (body.dealId) {
      const dealRow = await c.env.DB.prepare(`
        SELECT d.network, d.monthly_cost, d.upfront_cost, d.contract_months, p.name AS product_name
        FROM deals d
        LEFT JOIN products p ON p.id = d.product_id
        WHERE d.id = ?
      `).bind(body.dealId).first<{
        network: string;
        monthly_cost: number;
        upfront_cost: number;
        contract_months: number;
        product_name?: string;
      }>();

      if (!dealRow) {
        errors['dealId'] = 'Deal not found';
      } else if (body.networkProvider && body.networkProvider !== 'Outright' && body.networkProvider !== dealRow.network) {
        errors['networkProvider'] = 'Invalid network provider for this deal';
      } else {
        dealInfo = dealRow;
      }
    }

    if (Object.keys(errors).length > 0) {
      return c.json({ success: false, errors }, 400);
    }

    // ── Save customer to DB ──────────────────────────────────────────────────
    // Data mapped directly to DB according to Module A schema & Migration 004
    const customerId = crypto.randomUUID();
    const customerEmail     = sanitise.string(body.customer?.email)     || '';
    const customerFirstName = sanitise.string(body.customer?.firstName) || '';
    const customerLastName  = sanitise.string(body.customer?.lastName)  || '';

    await c.env.DB.prepare(`
      INSERT INTO customers (id, first_name, last_name, email, phone, date_of_birth, title, marketing_opt_in)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      customerId,
      customerFirstName,
      customerLastName,
      customerEmail,
      sanitise.string(body.customer?.mobile),
      sanitise.string(body.customer?.dateOfBirth),
      sanitise.string(body.customer?.title) || null,
      body.customer?.marketingOptIn ? 1 : 0
    ).run();

    // ── Save order to DB ─────────────────────────────────────────────────────
    const orderId = crypto.randomUUID();
    const billing = body.sameAsDelivery ? delivery : (body.billingAddress || {});

    await c.env.DB.prepare(`
      INSERT INTO orders (
        id, customer_id, deal_id, status, network_provider, same_as_delivery,
        delivery_address_line1, delivery_address_line2, delivery_city, delivery_county, delivery_postcode,
        billing_address_line1, billing_address_line2, billing_city, billing_county, billing_postcode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId,
      customerId,
      body.dealId || null,
      'PENDING',
      sanitise.string(body.networkProvider),
      body.sameAsDelivery ? 1 : 0,
      sanitise.string(delivery.line1),
      sanitise.string(delivery.line2) || null,
      sanitise.string(delivery.city),
      sanitise.string(delivery.county) || null,
      sanitise.string(delivery.postcode),
      sanitise.string(billing.line1),
      sanitise.string(billing.line2) || null,
      sanitise.string(billing.city),
      sanitise.string(billing.county) || null,
      sanitise.string(billing.postcode)
    ).run();

    // ── Send confirmation email (non-blocking — order succeeds regardless) ───
    // If email fails, the error is logged but does NOT affect the HTTP response.
    if (customerEmail && dealInfo) {
      const emailData: OrderEmailData = {
        orderId,
        customerName:   `${customerFirstName} ${customerLastName}`.trim(),
        customerEmail,
        productName:    dealInfo.product_name || 'Smartphone',
        network:        dealInfo.network,
        contractMonths: dealInfo.contract_months,
        monthlyAmount:  dealInfo.monthly_cost,
        upfrontAmount:  dealInfo.upfront_cost,
        deliveryAddress: {
          line1:    sanitise.string(delivery.line1)   || '',
          line2:    sanitise.string(delivery.line2)   || null,
          city:     sanitise.string(delivery.city)    || '',
          county:   sanitise.string(delivery.county)  || null,
          postcode: sanitise.string(delivery.postcode) || '',
        },
      };
      c.executionCtx.waitUntil(
        sendOrderEmail('confirmation', c.env, emailData).catch((err) => {
          console.error('[checkout] Unexpected error in sendOrderEmail:', err);
        })
      );
    }

    // Return real orderId and customer email so the frontend can display them
    return c.json({ success: true, orderId, email: customerEmail });

  } catch (error: any) {
    console.error('Checkout error:', error?.message ?? error);
    if (error?.stack) console.error('Stack:', error.stack);
    return c.json({
      success: false,
      message: 'Internal Server Error',
      // Surface the real error cause in logs (Cloudflare dashboard)
      debug: error?.message ?? String(error),
    }, 500);
  }
});

export default checkoutRouter;
