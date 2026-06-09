# PhoneDeals UK — Deployment Guide

This guide details the deployment architecture and process for PhoneDeals UK using Cloudflare to achieve a robust, high-performance site with zero ongoing infrastructure costs under the free tier.

## Architecture
- **Angular Frontend:** Deployed as static files to Cloudflare Pages (with build-time SSG via `ng build --prerender`).
- **Cloudflare Worker (API):** Deployed as a standalone serverless Worker.
- **Proxying:** Cloudflare Pages routes `/api/*` and `/sitemap.xml` directly to the Worker via `_routes.json`.
- **R2 Storage:** Product images are served via a custom R2 public bucket URL.

## Manual Cloudflare Pages Dashboard Setup

If you are not using the GitHub Actions pipeline, or setting it up for the first time via the Cloudflare dashboard:

1. **Connect Repository:** Go to Cloudflare Pages -> Connect to Git.
2. **Build Settings:**
   - **Framework preset:** None (or Angular)
   - **Build command:** `npm run build:prod` (or `node scripts/generate-prerender-routes.mjs && ng build --configuration=production`)
   - **Build output directory:** `dist/phonedeals-uk/browser`
3. **Environment Variables:**
   - `NODE_VERSION`: `20`
   - `API_URL`: The URL of your deployed Cloudflare Worker (e.g., `https://phonedeals-uk-api.workers.dev` or your custom domain).

## GitHub Actions CI/CD

Deployment is fully automated via the `.github/workflows/deploy.yml` GitHub Action.

**Required GitHub Repository Secrets:**
- `CLOUDFLARE_API_TOKEN`: Create an API token in your Cloudflare Profile with Edit permissions for Workers, Pages, D1, and R2.
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID (found in the Cloudflare dashboard URL or sidebar).

The pipeline will:
1. Deploy the Worker API first.
2. Run the `generate-prerender-routes.mjs` script to fetch active product slugs from the freshly deployed API.
3. Build the Angular app with pre-rendering.
4. Deploy the statically generated site to Cloudflare Pages.

---

## Production Verification Checklist

After the initial deployment finishes, verify the system is fully operational:

- [ ] **Home Page:** Visit `/` — home page loads and displays featured products.
- [ ] **Listing Pages:** Visit `/iphone` and `/samsung` — verify filtering works.
- [ ] **Product Detail:** Visit a specific product URL (`/phones/some-slug`) — verify it loads with its associated deals.
- [ ] **Admin Login:** Visit `/xk92-admin/login` — verify the unbranded login page appears.
- [ ] **Admin Access:** Log in with the admin credentials you created via `npm run db:seed:admin`. Dashboard should load.
- [ ] **Image Uploads:** Add a new product and upload a primary image. Verify the image saves to R2 and displays correctly.
- [ ] **Deal Management:** Add deals to the new product. Verify the deals appear on the public storefront.
- [ ] **Sitemap:** Visit `/sitemap.xml` — ensure it renders a valid XML sitemap including dynamic product routes.
- [ ] **Robots.txt:** Visit `/robots.txt` — verify it blocks the admin panel and points to the sitemap.
- [ ] **Search Console:** Submit the `sitemap.xml` URL to Google Search Console.
- [ ] **Performance:** Run a Lighthouse audit on a product detail page. Score should be > 90 for performance.
