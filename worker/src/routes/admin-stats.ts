import { Hono } from 'hono';
import { Env } from '../types';

const statsRouter = new Hono<{ Bindings: Env }>();

statsRouter.get('/dashboard-stats', async (c) => {
  try {
    const db = c.env.DB;

    // Execute queries in a single transaction-batch for extreme performance
    const results = await db.batch([
      db.prepare('SELECT COUNT(*) as total FROM products'),
      db.prepare('SELECT COUNT(*) as active FROM products WHERE is_active = 1'),
      db.prepare('SELECT COUNT(*) as total FROM deals'),
      db.prepare('SELECT COUNT(*) as active FROM deals WHERE is_active = 1'),
      db.prepare('SELECT COUNT(*) as count FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name LIKE "%iPhone%" OR c.slug LIKE "%iphone%"'),
      db.prepare('SELECT COUNT(*) as count FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name LIKE "%Samsung%" OR c.slug LIKE "%samsung%"'),
      db.prepare(`
        SELECT p.id, p.name, p.is_active, p.created_at, c.name as category_name 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC 
        LIMIT 5
      `)
    ]);

    // Safely extract counts (SQLite COUNT returns rows)
    const totalProducts = (results[0].results[0] as any)?.total || 0;
    const activeProducts = (results[1].results[0] as any)?.active || 0;
    const totalDeals = (results[2].results[0] as any)?.total || 0;
    const activeDeals = (results[3].results[0] as any)?.active || 0;
    const iPhoneProducts = (results[4].results[0] as any)?.count || 0;
    const samsungProducts = (results[5].results[0] as any)?.count || 0;
    const recentProducts = results[6].results || [];

    return c.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        totalDeals,
        activeDeals,
        iPhoneProducts,
        samsungProducts,
        recentProducts
      }
    });
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
    return c.json({ success: false, error: 'Failed to load dashboard stats' }, 500);
  }
});

export default statsRouter;
