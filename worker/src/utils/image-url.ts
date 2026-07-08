import { Product } from '../types';

/** Build the public URL stored in D1 and used by the frontend <img src>. */
export function buildPublicImageUrl(
  requestUrl: string,
  key: string,
  r2PublicUrl?: string
): string {
  if (r2PublicUrl) {
    return `${r2PublicUrl.replace(/\/$/, '')}/${key}`;
  }
  const origin = new URL(requestUrl).origin;
  return `${origin}/api/images/${key}`;
}

/** Rewrite legacy/wrong URLs to a working public URL. */
export function normalizeImageUrl(
  storedUrl: string | null | undefined,
  requestUrl: string,
  r2PublicUrl?: string
): string | null {
  if (!storedUrl) return null;

  // Already a correct absolute R2 public URL
  if (r2PublicUrl && storedUrl.startsWith(r2PublicUrl.replace(/\/$/, ''))) {
    return storedUrl;
  }

  // Any other https URL — return as-is (e.g. custom CDN domain already configured)
  if (storedUrl.startsWith('https://')) {
    return storedUrl;
  }

  if (storedUrl.includes('/api/images/')) {
    return storedUrl;
  }

  // Legacy hardcoded wrong domain — extract R2 key and rebuild
  const productsIdx = storedUrl.indexOf('products/');
  if (productsIdx !== -1) {
    const key = storedUrl.slice(productsIdx);
    return buildPublicImageUrl(requestUrl, key, r2PublicUrl);
  }

  if (storedUrl.startsWith('products/')) {
    return buildPublicImageUrl(requestUrl, storedUrl, r2PublicUrl);
  }

  return storedUrl;
}

export function normalizeProductImages(
  product: Product,
  requestUrl: string,
  r2PublicUrl?: string
): Product {
  const normalized: Product = {
    ...product,
  };
  if (product.variants) {
    try {
      const variants = JSON.parse(product.variants) as any[];
      normalized.variants = JSON.stringify(
        variants.map(v => ({
          ...v,
          images: (v.images || []).map((imgUrl: string) => normalizeImageUrl(imgUrl, requestUrl, r2PublicUrl))
        }))
      );
    } catch {
      // keep original JSON if parse fails
    }
  }

  return normalized;
}
