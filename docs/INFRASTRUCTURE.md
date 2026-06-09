# PhoneDeals UK — Infrastructure Setup

This document details the one-time Wrangler CLI commands required to provision the Cloudflare infrastructure for this project.

## 1. D1 Database (Serverless SQLite)

Create the database:
```bash
wrangler d1 create phonedeals-uk-db
```

*Important:* The output will contain a `database_id` and `database_name`. Copy the `database_id` into `wrangler.toml` under `[[d1_databases]]`.

## 2. R2 Object Storage (Images)

Create the bucket:
```bash
wrangler r2 bucket create phonedeals-uk-images
```

Apply the CORS configuration so the Angular frontend can upload images directly using pre-signed URLs (or via the proxy):
```bash
wrangler r2 bucket cors put phonedeals-uk-images --file=docs/r2-cors.json
```

## 3. KV Store (Session Management)

Create the KV namespace (if not already created):
```bash
wrangler kv:namespace create SESSIONS
```

*Important:* Copy the output `id` into `wrangler.toml` under `[[kv_namespaces]]`.

## 4. Production Secrets

The application requires a secure JWT secret for admin authentication. Generate a long, random string (e.g., using `openssl rand -hex 32`) and save it to Cloudflare:

```bash
wrangler secret put JWT_SECRET
```
(Paste your generated string when prompted)

## 5. Initial Database Migration & Seeding

After the infrastructure is provisioned, you must apply the initial schema and category seeds to the remote database:

```bash
cd worker
npm run db:setup:prod
```

To create your initial admin user, generate an insert statement (which hashes the password securely):
```bash
cd worker
npm run db:seed:admin
```
Follow the instructions to apply the generated SQL.
