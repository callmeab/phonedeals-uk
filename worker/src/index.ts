import { Hono } from 'hono';
import { Env } from './types';
import { authMiddleware } from './middleware/auth';
import authRouter from './routes/auth';
import statsRouter from './routes/admin-stats';
import { publicProductsRouter, adminProductsRouter } from './routes/products';
import uploadRouter from './routes/admin-upload';
import { publicDealsRouter, adminDealsRouter } from './routes/deals';
import { publicCategoriesRouter, adminCategoriesRouter } from './routes/categories';
import sitemapRouter from './routes/sitemap';
import imagesRouter from './routes/images';
import adminExtrasRouter from './routes/admin';
import debugRouter from './routes/debug';

// Create a new Hono app with our Env bindings
const app = new Hono<{ Bindings: Env }>();

// Base path for all API routes
const api = app.basePath('/api');

// Sitemap — served at root (before /api basePath)
app.route('/sitemap.xml', sitemapRouter);

// --- Public Routes ---
api.get('/health', (c) => c.json({ success: true, message: 'API is healthy' }));

// Mount public categories endpoint
api.route('/categories', publicCategoriesRouter);

// Mount public product endpoints
api.route('/products', publicProductsRouter);

// Mount public deal endpoints
api.route('/deals', publicDealsRouter);

// Public image proxy (serves R2 uploads — required for local dev)
api.route('/images', imagesRouter);

// Temporary debug routes — remove before production deploy
api.route('/debug', debugRouter);

// Admin Authentication endpoint
api.route('/admin', authRouter);

// --- Protected Routes ---
// Create a separate router for admin routes to apply middleware cleanly
const adminRoutes = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all admin routes below this point
adminRoutes.use('*', authMiddleware);

// Admin dashboard stats
adminRoutes.route('/', statsRouter);

// Mount protected admin product endpoints
adminRoutes.route('/products', adminProductsRouter);

// Mount protected admin deal endpoints
adminRoutes.route('/deals', adminDealsRouter);

adminRoutes.route('/upload', uploadRouter);
adminRoutes.route('/', adminExtrasRouter);

// Mount protected admin categories endpoint
adminRoutes.route('/categories', adminCategoriesRouter);

// Mount protected admin routes under /api/admin
api.route('/admin', adminRoutes);

export default app;
