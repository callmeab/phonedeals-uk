import { Hono } from 'hono';
import { Env } from '../types';

const imagesRouter = new Hono<{ Bindings: Env }>();

/** Public R2 image proxy — serves uploaded product images from the IMAGES bucket. */
imagesRouter.get('/*', async (c) => {
  // c.req.path is the full path e.g. /api/images/products/123.jpg
  // We need to strip /api/images/ to get the actual R2 object key
  const key = c.req.path.replace(/^\/api\/images\//, '');
  if (!key) {
    return c.json({ success: false, error: 'Image key required' }, 400);
  }

  const object = await c.env.IMAGES.get(key);
  if (!object) {
    return c.notFound();
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(object.body, { headers });
});

export default imagesRouter;
