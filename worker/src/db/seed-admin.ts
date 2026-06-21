import { crypto } from 'node:crypto';

// Use native Node.js webcrypto which correctly mimics the Cloudflare Workers API
const webcrypto = globalThis.crypto || require('node:crypto').webcrypto;

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generatePasswordHash(password: string): Promise<string> {
  const iterations = 100000;
  // Generate 16 bytes (128-bit) of secure random salt
  const saltBytes = webcrypto.getRandomValues(new Uint8Array(16));
  
  const encoder = new TextEncoder();
  const passwordKey = await webcrypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hashBuffer = await webcrypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: iterations,
      hash: 'SHA-256'
    },
    passwordKey,
    256 // Derive 32 bytes (256 bits)
  );

  const saltStr = base64UrlEncode(saltBytes);
  const hashStr = base64UrlEncode(new Uint8Array(hashBuffer));

  return `pbkdf2:sha256:${iterations}:${saltStr}:${hashStr}`;
}

async function run() {
  const email = 'admin@phonedeals.co.uk';
  const password = 'ChangeMe2025!';

  console.log(`Generating PBKDF2 hash for password: ${password}`);
  
  // Why PBKDF2 over bcrypt?
  // Cloudflare Workers runtime does not support native Node.js modules or C++ bindings like bcrypt.
  // PBKDF2 is a secure standard algorithm fully supported natively by the Web Crypto API.
  const hash = await generatePasswordHash(password);

  console.log('\n--- HOW TO CHANGE THE ADMIN PASSWORD ---');
  console.log(`1. Modify the password variable in this script.`);
  console.log(`2. Re-run 'npm run seed:admin'.`);
  console.log(`3. Execute the resulting SQL command to update D1.`);
  
  console.log('\n--- JWT SECRET FOR PRODUCTION ---');
  console.log(`For production deployment, you MUST securely set the JWT_SECRET!`);
  console.log(`Run: npx wrangler secret put JWT_SECRET`);
  
  console.log('\n--- RUN THIS SQL TO SEED D1 (Local Dev) ---');
  const sql = `INSERT OR REPLACE INTO admins (email, password_hash) VALUES ('${email}', '${hash}');`;
  console.log(`npx wrangler d1 execute phonedeals-uk-db --local --command="${sql}"`);
  
  console.log('\n--- RUN THIS SQL TO SEED D1 (Production) ---');
  console.log(`npx wrangler d1 execute phonedeals-uk-db --remote --command="${sql}"`);
}

run().catch(console.error);
