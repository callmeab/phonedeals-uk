import { Hono } from 'hono';
import { Env } from '../types';

const debugRouter = new Hono<{ Bindings: Env }>();

/**
 * Temporary diagnostic endpoint — remove before production deploy.
 * GET /api/debug/image-check?product_id=<id>
 */
debugRouter.get('/image-check', async (c) => {
  const productId = c.req.query('product_id');
  if (!productId) {
    return c.json({ success: false, error: 'product_id query param is required' }, 400);
  }

  const row = await c.env.DB.prepare(
    'SELECT id, name FROM products WHERE id = ?'
  ).bind(productId).first<{ id: number; name: string }>();

  if (!row) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  let rawUrl: string | null = null;
  const r2PublicUrl = c.env.R2_PUBLIC_URL ?? null;

  return c.json({
    success: true,
    data: {
      product_id: row.id,
      name: row.name,
      primary_image_url: null,
      starts_with_https: rawUrl ? (rawUrl as string).startsWith('https://') : false,
      r2_public_url_configured: r2PublicUrl,
      r2_public_url_from_env: r2PublicUrl ?? '(not set — local dev uses /api/images proxy)',
      hint: !rawUrl
        ? 'No image URL stored in D1 for this product.'
        : !(rawUrl as string).startsWith('https://') && !(rawUrl as string).includes('/api/images/')
          ? 'URL may be malformed — re-upload via admin panel.'
          : 'Paste variant image url into browser to test loading.',
    },
  });
});

/**
 * Temporary diagnostic endpoint — check email configuration.
 * GET /api/debug/email-check
 * Returns whether RESEND_API_KEY is available (without exposing the actual value).
 */
debugRouter.get('/email-check', async (c) => {
  const hasKey = !!c.env.RESEND_API_KEY;
  const keyLength = c.env.RESEND_API_KEY ? c.env.RESEND_API_KEY.length : 0;
  const keyPrefix = c.env.RESEND_API_KEY ? c.env.RESEND_API_KEY.substring(0, 6) + '...' : '(not set)';

  return c.json({
    success: true,
    email_config: {
      resend_api_key_set: hasKey,
      key_length: keyLength,
      key_prefix: keyPrefix,
      sender_email: 'orders@mobello.uk',
      note: hasKey 
        ? 'RESEND_API_KEY is configured — emails should work'
        : 'RESEND_API_KEY is NOT configured — all emails are being SKIPPED silently'
    }
  });
});

export default debugRouter;
