import { Hono } from 'hono';
import { Env } from '../types';
import { buildPublicImageUrl } from '../utils/image-url';

const uploadRouter = new Hono<{ Bindings: Env }>();

// Simple, dependency-free direct proxy upload
uploadRouter.post('/', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] as File;
    
    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    // Generate a unique, URL-safe key for the image
    const providedKey = body['key'] as string | undefined;
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const key =
      providedKey && /^products\/[\w.\-]+$/.test(providedKey)
        ? providedKey
        : `products/${timestamp}-${cleanName}`;

    // Put directly into the R2 bucket natively via the binding
    await c.env.IMAGES.put(key, file, {
      httpMetadata: {
        contentType: file.type,
      }
    });

    const publicUrl = buildPublicImageUrl(c.req.url, key, c.env.R2_PUBLIC_URL);

    return c.json({ 
      success: true, 
      data: {
        key,
        publicUrl 
      }
    });
  } catch (err) {
    console.error('Upload Error:', err);
    return c.json({ success: false, error: 'Failed to upload image' }, 500);
  }
});

export default uploadRouter;
