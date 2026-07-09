import { Hono } from 'hono';
import { Env } from '../types';
import { signJWT, base64UrlDecode } from '../utils/jwt';

const authRouter = new Hono<{ Bindings: Env }>();

// Password comparison utility using PBKDF2 and Web Crypto
// Why PBKDF2 over bcrypt? Cloudflare Workers runtime does not support native Node.js
// modules or C++ bindings like bcrypt. PBKDF2 is a standard supported by the native Web Crypto API.
// Format: pbkdf2:sha256:100000:<saltBase64Url>:<hashBase64Url>
async function verifyPassword(password: string, storedHashString: string): Promise<boolean> {
  try {
    const parts = storedHashString.split(':');
    if (parts.length !== 5 || parts[0] !== 'pbkdf2' || parts[1] !== 'sha256') {
      return false;
    }

    const iterations = parseInt(parts[2], 10);
    const saltBytes = base64UrlDecode(parts[3]);
    const storedHashBytes = base64UrlDecode(parts[4]);

    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes as any,
        iterations: iterations,
        hash: 'SHA-256'
      },
      passwordKey,
      256 // 32 bytes output
    );

    const hashBytes = new Uint8Array(hashBuffer);

    // Timing safe comparison to prevent timing attacks mapping to crypto.subtle.timingSafeEqual
    if (hashBytes.length !== storedHashBytes.length) return false;
    
    let mismatch = 0;
    for (let i = 0; i < hashBytes.length; i++) {
      mismatch |= (hashBytes[i] ^ storedHashBytes[i]);
    }
    
    return mismatch === 0;
  } catch (e) {
    return false;
  }
}

authRouter.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    if (!body || !body.email || !body.password) {
      return c.json({ success: false, error: 'Missing email or password' }, 400);
    }

    const db = c.env.DB;
    const user: any = await db.prepare('SELECT id, email, password_hash FROM admins WHERE email = ?')
      .bind(body.email)
      .first();

    // Generic error message to prevent user enumeration
    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Gracefully handle un-seeded db hashes
    if (user.password_hash === 'PLACEHOLDER_HASH_REPLACE_ME') {
      return c.json({ success: false, error: 'Admin account not fully setup (Hash is still a placeholder)' }, 401);
    }

    const isMatch = await verifyPassword(body.password, user.password_hash);
    if (!isMatch) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Generate signed JWT
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (8 * 60 * 60); // 8 hours validity
    
    const payload = {
      sub: user.id,
      email: user.email,
      iat: now,
      exp: exp
    };

    const token = await signJWT(payload, c.env.JWT_SECRET);

    return c.json({
      success: true,
      token,
      expiresAt: new Date(exp * 1000).toISOString()
    });

  } catch (e) {
    return c.json({ success: false, error: 'Invalid request' }, 400);
  }
});

export default authRouter;
