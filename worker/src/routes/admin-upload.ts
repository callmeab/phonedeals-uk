import { Hono, Context } from 'hono';
import { Env } from '../types';
import { buildPublicImageUrl } from '../utils/image-url';

const uploadRouter = new Hono<{ Bindings: Env }>();

// Simple, dependency-free direct proxy upload
const uploadHandler = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] as File;
    
    if (!file) {
      console.warn('Upload attempt without a file in the payload');
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      console.warn(`Upload rejected: File size ${file.size} exceeds 5MB limit`);
      return c.json({ success: false, error: 'File size exceeds 5MB limit' }, 400);
    }

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      console.warn(`Upload rejected: Invalid file type ${file.type}`);
      return c.json({ success: false, error: 'Invalid file format. Supported: JPEG, PNG, WEBP, GIF' }, 400);
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
    console.log(`Uploading file ${file.name} to R2 bucket at key ${key}...`);
    await c.env.IMAGES.put(key, file, {
      httpMetadata: {
        contentType: file.type,
      }
    });
    console.log(`Successfully uploaded ${key} to R2 bucket.`);

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
    return c.json({ 
      success: false, 
      error: 'Failed to upload image', 
      details: err instanceof Error ? err.message : String(err) 
    }, 500);
  }
};

uploadRouter.post('/', uploadHandler);
uploadRouter.post('', uploadHandler);

export default uploadRouter;
