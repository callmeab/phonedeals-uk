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
    'SELECT id, name, primary_image_url FROM products WHERE id = ?'
  ).bind(productId).first<{ id: number; name: string; primary_image_url: string | null }>();

  if (!row) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  const rawUrl = row.primary_image_url;
  const r2PublicUrl = c.env.R2_PUBLIC_URL ?? null;

  return c.json({
    success: true,
    data: {
      product_id: row.id,
      name: row.name,
      primary_image_url: rawUrl,
      starts_with_https: rawUrl ? rawUrl.startsWith('https://') : false,
      r2_public_url_configured: r2PublicUrl,
      r2_public_url_from_env: r2PublicUrl ?? '(not set — local dev uses /api/images proxy)',
      hint: !rawUrl
        ? 'No image URL stored in D1 for this product.'
        : !rawUrl.startsWith('https://') && !rawUrl.includes('/api/images/')
          ? 'URL may be malformed — re-upload via admin panel.'
          : 'Paste primary_image_url into browser to test loading.',
    },
  });
});

export default debugRouter;
