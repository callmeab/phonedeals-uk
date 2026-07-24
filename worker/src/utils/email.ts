import { Env } from '../types';

// =============================================================================
// Email Configuration — Change these constants to update sender details.
// For production: replace SENDER_EMAIL with a verified domain address.
// For testing:    onboarding@resend.dev works on Resend free plan.
//                 afaseeh11@gmail.com requires domain verification first.
// =============================================================================

export const SENDER_EMAIL = 'orders@mobello.uk'; 
export const SENDER_NAME  = 'Mobello.UK';
export const SUPPORT_EMAIL = 'support@mobello.uk';
export const SUPPORT_PHONE = '0800 123 4567';
export const BRAND_COLOR   = '#6366f1'; // Indigo — matches the site theme

// =============================================================================
// Types
// =============================================================================

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  network: string;
  contractMonths: number;
  monthlyAmount: number;
  upfrontAmount: number;
  deliveryAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    county?: string | null;
    postcode: string;
  };
  estimatedDeliveryDate?: string;
}

export type OrderEmailType =
  | 'confirmation'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered';

// =============================================================================
// Resend API caller (raw fetch — no SDK, works in Cloudflare Workers)
// =============================================================================

async function callResendApi(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: [to],
        reply_to: SUPPORT_EMAIL,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `Resend API error ${response.status}: ${errorBody}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Unknown fetch error' };
  }
}

// =============================================================================
// Shared HTML Layout (email-client-safe inline CSS)
// =============================================================================

function wrapInLayout(bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mobello.UK</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
         style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
               style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;
                      overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
                       padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;
                         letter-spacing:-0.5px;">Mobello.UK</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                Great deals on the latest smartphones
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;
                       text-align:center;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                Need help? Contact us at
                <a href="mailto:${SUPPORT_EMAIL}" style="color:#6366f1;text-decoration:none;">
                  ${SUPPORT_EMAIL}
                </a>
                or call <strong>${SUPPORT_PHONE}</strong>
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} Mobello.UK. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// =============================================================================
// Helper: format estimated delivery (5 business days from now)
// =============================================================================

function getEstimatedDelivery(customDate?: string): string {
  if (customDate) return customDate;
  const date = new Date();
  let businessDays = 0;
  while (businessDays < 5) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) businessDays++; // skip weekends
  }
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

function formatAddress(addr: OrderEmailData['deliveryAddress']): string {
  return [addr.line1, addr.line2, addr.city, addr.county, addr.postcode]
    .filter(Boolean)
    .join(', ');
}

// =============================================================================
// Template 1: Order Confirmation Email
// =============================================================================

function buildConfirmationEmail(data: OrderEmailData): { subject: string; html: string } {
  const subject = `Order Confirmed — ${data.orderId} | Mobello.UK`;
  const delivery = getEstimatedDelivery(data.estimatedDeliveryDate);

  const html = wrapInLayout(`
    <!-- Status badge -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background-color:#dcfce7;color:#16a34a;
                  font-size:13px;font-weight:600;padding:6px 16px;border-radius:999px;
                  letter-spacing:0.5px;">
        ✓ ORDER CONFIRMED
      </div>
    </div>

    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">
      Thanks, ${data.customerName.split(' ')[0]}! Your order is confirmed.
    </h2>
    <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
      We've received your order and it's being processed. You'll receive a shipping
      notification once it's on its way.
    </p>

    <!-- Order ID highlight -->
    <div style="background:#f5f3ff;border:1px solid #ede9fe;border-radius:12px;
                padding:20px;margin-bottom:28px;text-align:center;">
      <p style="margin:0 0 4px;color:#7c3aed;font-size:12px;font-weight:600;
                text-transform:uppercase;letter-spacing:1px;">Order Reference</p>
      <p style="margin:0;color:#4c1d95;font-size:22px;font-weight:700;
                font-family:monospace,monospace;">${data.orderId}</p>
    </div>

    <!-- Order Details -->
    <h3 style="margin:0 0 16px;color:#374151;font-size:14px;font-weight:600;
               text-transform:uppercase;letter-spacing:0.5px;">Order Details</h3>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;
                  margin-bottom:28px;">
      <tr style="background-color:#f9fafb;">
        <td style="padding:14px 20px;font-size:14px;font-weight:600;color:#374151;
                   border-bottom:1px solid #e5e7eb;">Product</td>
        <td style="padding:14px 20px;font-size:14px;color:#6b7280;
                   border-bottom:1px solid #e5e7eb;text-align:right;">
          ${data.productName}
        </td>
      </tr>
      <tr>
        <td style="padding:14px 20px;font-size:14px;font-weight:600;color:#374151;
                   border-bottom:1px solid #e5e7eb;">Network</td>
        <td style="padding:14px 20px;font-size:14px;color:#6b7280;
                   border-bottom:1px solid #e5e7eb;text-align:right;">${data.network}</td>
      </tr>
      <tr style="background-color:#f9fafb;">
        <td style="padding:14px 20px;font-size:14px;font-weight:600;color:#374151;
                   border-bottom:1px solid #e5e7eb;">Contract</td>
        <td style="padding:14px 20px;font-size:14px;color:#6b7280;
                   border-bottom:1px solid #e5e7eb;text-align:right;">
          ${data.contractMonths} months
        </td>
      </tr>
      <tr>
        <td style="padding:14px 20px;font-size:14px;font-weight:600;color:#374151;
                   border-bottom:1px solid #e5e7eb;">Monthly Cost</td>
        <td style="padding:14px 20px;font-size:14px;color:#6b7280;
                   border-bottom:1px solid #e5e7eb;text-align:right;">
          ${formatCurrency(data.monthlyAmount)}/mo
        </td>
      </tr>
      <tr style="background-color:#f9fafb;">
        <td style="padding:14px 20px;font-size:14px;font-weight:700;color:#111827;">
          Upfront Cost
        </td>
        <td style="padding:14px 20px;font-size:16px;font-weight:700;color:#6366f1;
                   text-align:right;">
          ${formatCurrency(data.upfrontAmount)}
        </td>
      </tr>
    </table>

    <!-- Shipping Address -->
    <h3 style="margin:0 0 12px;color:#374151;font-size:14px;font-weight:600;
               text-transform:uppercase;letter-spacing:0.5px;">Shipping Address</h3>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;
                padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;">
        ${formatAddress(data.deliveryAddress).replace(/, /g, '<br />')}
      </p>
    </div>

    <!-- Estimated Delivery -->
    <div style="background:linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%);
                border:1px solid #bfdbfe;border-radius:12px;padding:20px;
                margin-bottom:32px;text-align:center;">
      <p style="margin:0 0 4px;color:#1d4ed8;font-size:12px;font-weight:600;
                text-transform:uppercase;letter-spacing:1px;">📦 Estimated Delivery</p>
      <p style="margin:0;color:#1e3a8a;font-size:16px;font-weight:700;">${delivery}</p>
    </div>

    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
      Questions? Reply to this email or contact our support team.<br />
      We're here to help, 7 days a week.
    </p>
  `);

  return { subject, html };
}

// =============================================================================
// Template 2: Shipping Status Update Email
// =============================================================================

const STATUS_CONFIG: Record<
  'shipped' | 'out_for_delivery' | 'delivered',
  { badge: string; badgeColor: string; badgeBg: string; icon: string; headline: string; body: string }
> = {
  shipped: {
    badge: 'ORDER SHIPPED',
    badgeColor: '#1d4ed8',
    badgeBg: '#dbeafe',
    icon: '🚚',
    headline: 'Your order is on its way!',
    body: 'Great news! Your Mobello.UK order has been dispatched and is heading to you. You can expect delivery within 1–3 business days.',
  },
  out_for_delivery: {
    badge: 'OUT FOR DELIVERY',
    badgeColor: '#d97706',
    badgeBg: '#fef3c7',
    icon: '🏃',
    headline: 'Your order is out for delivery today!',
    body: 'Your order is with the courier and is due for delivery today. Please make sure someone is available to receive it.',
  },
  delivered: {
    badge: 'DELIVERED',
    badgeColor: '#16a34a',
    badgeBg: '#dcfce7',
    icon: '🎉',
    headline: 'Your order has been delivered!',
    body: 'Your Mobello.UK order has been successfully delivered. We hope you love your new phone! If you have any issues, please contact us within 30 days.',
  },
};

function buildShippingEmail(
  data: OrderEmailData,
  status: 'shipped' | 'out_for_delivery' | 'delivered',
): { subject: string; html: string } {
  const cfg = STATUS_CONFIG[status];
  const subjectMap: Record<string, string> = {
    shipped:          `Your order has been shipped — ${data.orderId}`,
    out_for_delivery: `Your order is out for delivery — ${data.orderId}`,
    delivered:        `Your order has been delivered — ${data.orderId}`,
  };

  const html = wrapInLayout(`
    <!-- Status badge -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background-color:${cfg.badgeBg};
                  color:${cfg.badgeColor};font-size:13px;font-weight:600;
                  padding:6px 16px;border-radius:999px;letter-spacing:0.5px;">
        ${cfg.icon} ${cfg.badge}
      </div>
    </div>

    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">
      ${cfg.headline}
    </h2>
    <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
      ${cfg.body}
    </p>

    <!-- Order reference -->
    <div style="background:#f5f3ff;border:1px solid #ede9fe;border-radius:12px;
                padding:16px;margin-bottom:28px;text-align:center;">
      <p style="margin:0 0 4px;color:#7c3aed;font-size:12px;font-weight:600;
                text-transform:uppercase;letter-spacing:1px;">Order Reference</p>
      <p style="margin:0;color:#4c1d95;font-size:20px;font-weight:700;
                font-family:monospace,monospace;">${data.orderId}</p>
    </div>

    <!-- Product summary -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;
                  margin-bottom:28px;">
      <tr style="background-color:#f9fafb;">
        <td style="padding:14px 20px;font-size:14px;font-weight:600;color:#374151;
                   border-bottom:1px solid #e5e7eb;">Product</td>
        <td style="padding:14px 20px;font-size:14px;color:#6b7280;
                   border-bottom:1px solid #e5e7eb;text-align:right;">
          ${data.productName}
        </td>
      </tr>
      <tr>
        <td style="padding:14px 20px;font-size:14px;font-weight:600;color:#374151;">
          Network
        </td>
        <td style="padding:14px 20px;font-size:14px;color:#6b7280;text-align:right;">
          ${data.network}
        </td>
      </tr>
    </table>

    <!-- Delivery address -->
    <h3 style="margin:0 0 12px;color:#374151;font-size:14px;font-weight:600;
               text-transform:uppercase;letter-spacing:0.5px;">Delivery Address</h3>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;
                padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;">
        ${formatAddress(data.deliveryAddress).replace(/, /g, '<br />')}
      </p>
    </div>

    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;line-height:1.6;">
      If you have any questions about your order, don't hesitate to get in touch.
    </p>
  `);

  return { subject: subjectMap[status], html };
}

// =============================================================================
// Public API: sendOrderEmail — single dispatcher for all email types
// =============================================================================

/**
 * Send an order-related email via the Resend API.
 *
 * @param type      'confirmation' | 'shipped' | 'out_for_delivery' | 'delivered'
 * @param env       Cloudflare Worker Env bindings (needs RESEND_API_KEY)
 * @param data      Order data to populate the email template
 *
 * NOTE: This function NEVER throws. On failure it logs the error and returns
 * { success: false } — the caller should NOT fail the HTTP response because
 * of an email error. Order creation must succeed independently.
 */
export async function sendOrderEmail(
  type: OrderEmailType,
  env: Env,
  data: OrderEmailData,
): Promise<{ success: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email send');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  let subject: string;
  let html: string;

  if (type === 'confirmation') {
    ({ subject, html } = buildConfirmationEmail(data));
  } else if (type === 'shipped' || type === 'out_for_delivery' || type === 'delivered') {
    ({ subject, html } = buildShippingEmail(data, type));
  } else {
    return { success: false, error: `Unknown email type: ${type}` };
  }

  const result = await callResendApi(env.RESEND_API_KEY, data.customerEmail, subject, html);

  if (!result.success) {
    // Log error but do NOT propagate — order must succeed regardless
    console.error(`[email] Failed to send ${type} email to ${data.customerEmail}:`, result.error);
  } else {
    console.log(`[email] Sent ${type} email to ${data.customerEmail} (order: ${data.orderId})`);
  }

  return result;
}
