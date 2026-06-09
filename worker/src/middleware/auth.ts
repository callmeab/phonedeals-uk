import { Context, Next } from 'hono';
import { Env } from '../types';
import { verifyJWT } from '../utils/jwt';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized: Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyJWT(token, c.env.JWT_SECRET);

  if (!payload) {
    return c.json({ success: false, error: 'Unauthorized: Invalid or expired token' }, 401);
  }

  // Set decoded payload in context for downstream route handlers
  c.set('adminUser', payload);
  await next();
}
