# Testing Guide

This project includes unit and integration tests across both the Angular frontend and the Cloudflare Worker backend.

## Angular Frontend (Jasmine/Karma)

The frontend uses Angular's default testing stack: Jasmine for defining tests and Karma as the test runner.

**To run the frontend tests:**
```bash
npm run test
```

This will launch Karma, open a headless browser, and run all `.spec.ts` files located in the `src/app/` directory (such as `auth.service.spec.ts` and `seo.service.spec.ts`).

## Cloudflare Worker Backend (Vitest)

The worker backend uses Vitest, an extremely fast test runner native to the Vite ecosystem, configured to run in a Node environment.

**To run the worker tests:**
```bash
cd worker
npx vitest run
```

This will run all `.test.ts` files located in `src/` and `test/` (such as `slugify.test.ts` and `api.test.ts`).

**To run in watch mode (for development):**
```bash
npx vitest
```
