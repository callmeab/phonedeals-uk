import { Hono } from 'hono';
import { Env } from '../types';

const sitemapRouter = new Hono<{ Bindings: Env }>();

const BASE_URL = 'https://www.phonedealsuk.co.uk';

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc: string, changefreq: string, priority: string, lastmod?: string): string {
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

sitemapRouter.get('/', async (c) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Fetch all active products for dynamic URLs
  const { results } = await c.env.DB.prepare(`
    SELECT slug, updated_at
    FROM products
    WHERE is_active = 1
    ORDER BY updated_at DESC
  `).all<{ slug: string; updated_at: string }>();

  const staticEntries = [
    urlEntry(`${BASE_URL}/`,        'daily',  '1.0', today),
    urlEntry(`${BASE_URL}/iphone`,  'daily',  '0.9', today),
    urlEntry(`${BASE_URL}/samsung`, 'daily',  '0.9', today),
  ];

  const productEntries = results.map(p => {
    const lastmod = p.updated_at
      ? p.updated_at.split('T')[0]
      : today;
    return urlEntry(`${BASE_URL}/phones/${xmlEscape(p.slug)}`, 'weekly', '0.8', lastmod);
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    ...staticEntries,
    ...productEntries,
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Cache for 4 hours in CDN, revalidate in background
      'Cache-Control': 'public, max-age=14400, stale-while-revalidate=86400',
    },
  });
});

export default sitemapRouter;
