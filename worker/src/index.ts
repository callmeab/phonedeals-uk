import { Hono } from 'hono';
import { cors } from 'hono/cors';
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
import checkoutRouter from './routes/checkout';
import ordersRouter from './routes/orders';
import preorderRouter from './routes/preorder';

// Create a new Hono app with our Env bindings
const app = new Hono<{ Bindings: Env }>();

// CORS — allow Angular dev server (4200) and production domain
app.use('*', cors({
  origin: ['http://localhost:4200', 'https://mobello.uk', 'https://www.mobello.uk'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


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

// Checkout flow
api.route('/checkout', checkoutRouter);

// Pre-order flow (iPhone 18 Pro / Pro Max)
api.route('/preorder', preorderRouter);

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

// Mount protected orders endpoint (view + status updates with shipping emails)
adminRoutes.route('/orders', ordersRouter);

// Mount protected admin routes under /api/admin
api.route('/admin', adminRoutes);

export default app;
