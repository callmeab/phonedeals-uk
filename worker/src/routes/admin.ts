import { Hono } from 'hono';
import { Env } from '../types';
import { buildPublicImageUrl } from '../utils/image-url';

type R2BucketWithPresign = R2Bucket & {
  createPresignedUrl?: (
    method: 'GET' | 'PUT' | 'DELETE',
    key: string,
    options?: { expiration?: number; expiresIn?: number }
  ) => Promise<string>;
};

const adminRouter = new Hono<{ Bindings: Env }>();

function sanitiseFilename(filename: string): string {
  const base = filename.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
  return `products/${Date.now()}-${base}`;
}

/**
 * POST /api/admin/upload-url
 * Body: { filename: string, contentType: string }
 *
 * Returns presigned PUT URL for direct browser → R2 upload, plus the public URL
 * that must be saved into D1 (publicUrl, NOT uploadUrl).
 */
adminRouter.post('/upload-url', async (c) => {
  try {
    const body = await c.req.json<{ filename?: string; contentType?: string }>();
    if (!body?.filename || !body?.contentType) {
      return c.json({ success: false, error: 'filename and contentType are required' }, 400);
    }

    const safeFilename = sanitiseFilename(body.filename);
    const publicUrl = buildPublicImageUrl(c.req.url, safeFilename, c.env.R2_PUBLIC_URL);

    const bucket = c.env.IMAGES as R2BucketWithPresign;

    if (typeof bucket.createPresignedUrl === 'function') {
      const uploadUrl = await bucket.createPresignedUrl('PUT', safeFilename, {
        expiration: 300,
      });

      return c.json({
        success: true,
        data: { uploadUrl, publicUrl, filename: safeFilename },
      });
    }

    // Local Miniflare: presigned URLs not available — client uses POST /api/admin/upload with key
    return c.json({
      success: true,
      data: {
        uploadUrl: null,
        publicUrl,
        filename: safeFilename,
        useDirectUpload: true,
      },
    });
  } catch (err) {
    console.error('upload-url error:', err);
    return c.json({ success: false, error: 'Failed to generate upload URL' }, 500);
  }
});

export default adminRouter;
