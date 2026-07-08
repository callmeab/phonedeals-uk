import { Hono } from 'hono';
import { Env } from '../types';

const imagesRouter = new Hono<{ Bindings: Env }>();

/** Public R2 image proxy — serves uploaded product images from the IMAGES bucket. */
imagesRouter.get('/*', async (c) => {
  // Extract the key robustly, handling potential leading slashes or missing base paths
  let key = c.req.path;
  const match = key.match(/images\/(.+)$/);
  if (match) {
    key = match[1];
  }
  // Strip any leading slash just in case
  key = key.replace(/^\//, '');
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
