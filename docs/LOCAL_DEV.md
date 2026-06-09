# Local Development Guide

This guide outlines how to run the full PhoneDeals UK stack (Angular + Cloudflare Worker) locally.

## Prerequisites
- Node.js (v18+)
- npm

## 1. Install Dependencies

You need to install dependencies in both the root folder (Angular) and the worker folder:

```bash
# In the root folder
npm install

# In the worker folder
cd worker
npm install
```

## 2. Local Environment Variables

The Cloudflare Worker needs a local JWT secret for development.

Create a `.dev.vars` file inside the `worker/` directory:
```bash
# worker/.dev.vars
JWT_SECRET=dev-secret-change-in-prod
```

## 3. Start the Cloudflare Worker API

In a new terminal window, start the local Wrangler development server:

```bash
cd worker
npm run dev
```

This will run the API on `http://localhost:8787`. It automatically uses a local SQLite file for D1, local filesystem for R2, and local memory for KV.

### Setup Local DB (First time only)
Run the initial migrations to set up your local SQLite database:
```bash
cd worker
npm run db:setup
```

## 4. Start the Angular Frontend

In another terminal window, return to the project root and start the Angular development server:

```bash
ng serve
```

This will run the frontend on `http://localhost:4200`.

### Proxying
Angular is configured (via `proxy.conf.json`) to automatically proxy any request starting with `/api` or `/sitemap.xml` directly to `http://localhost:8787`. This completely bypasses CORS issues during local development.

## 5. Accessing the Site
- Public Storefront: http://localhost:4200
- Admin Panel: http://localhost:4200/xk92-admin
