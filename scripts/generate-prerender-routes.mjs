#!/usr/bin/env node
/**
 * scripts/generate-prerender-routes.mjs
 *
 * Pre-build script that fetches all live product slugs from the API and writes
 * them to routes.txt so Angular's prerender build can statically render each
 * product detail page at build time (Option A — full SSG for product pages).
 *
 * OPTION A (this script) — Recommended for production:
 *   Fetches slugs at build time from a running API, pre-renders every
 *   /phones/:slug as a static HTML file. Best Core Web Vitals + SEO.
 *   Requires the Worker API to be deployed before running `ng build`.
 *
 * OPTION B — Simpler fallback:
 *   Remove `routesFile` from angular.json and let product detail pages
 *   render client-side only. No build-time API dependency, but Google
 *   sees an empty shell until JS hydrates (weaker SEO for product pages).
 *
 * Usage:
 *   node scripts/generate-prerender-routes.mjs
 *   (Run this before `ng build --configuration production`)
 *
 * CI/CD integration (package.json):
 *   "build:prod": "node scripts/generate-prerender-routes.mjs && ng build --configuration production"
 *
 * Environment variables:
 *   API_URL — override the base API URL (defaults to production Worker URL)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = join(__dirname, '..', 'routes.txt');

// Default to the production Worker. Override via env var in CI.
const API_URL = process.env['API_URL'] ?? 'https://api.phonedealsuk.co.uk';

// Static routes always pre-rendered regardless of products
const STATIC_ROUTES = ['/', '/iphone', '/samsung', '/iphone-18-pro-preorder'];

async function fetchAllSlugs() {
  const url = `${API_URL}/api/products?limit=500`;
  console.log(`📡 Fetching product slugs from: ${url}`);

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`API responded with HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();

  if (!json.success || !Array.isArray(json.data)) {
    throw new Error(`Unexpected API response shape: ${JSON.stringify(json).slice(0, 200)}`);
  }

  return json.data
    .filter(p => p.is_active && p.slug)
    .map(p => `/phones/${p.slug}`);
}

async function main() {
  let productRoutes = [];

  try {
    productRoutes = await fetchAllSlugs();
    console.log(`✅ Found ${productRoutes.length} active product slugs`);
  } catch (err) {
    console.warn(`⚠️  Could not fetch slugs (${err.message})`);
    console.warn('   Falling back to static routes only. Product pages will be CSR.');
    // In CI with a live API this should never happen — fail loudly in strict mode
    if (process.env['STRICT_PRERENDER'] === 'true') {
      process.exit(1);
    }
  }

  const allRoutes = [...STATIC_ROUTES, ...productRoutes];
  const content = allRoutes.join('\n') + '\n';

  writeFileSync(OUTPUT_FILE, content, 'utf-8');

  console.log(`📝 Written ${allRoutes.length} routes to routes.txt:`);
  allRoutes.slice(0, 10).forEach(r => console.log(`   ${r}`));
  if (allRoutes.length > 10) {
    console.log(`   … and ${allRoutes.length - 10} more`);
  }
}

main().catch(err => {
  console.error('❌ generate-prerender-routes failed:', err);
  process.exit(1);
});
