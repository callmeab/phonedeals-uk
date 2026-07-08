import { Product, ProductVariant } from '../models/product.model';

/** Resolve product image URLs for display in templates. */
export function resolveProductImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Absolute URLs (R2 public bucket, CDN, or full worker URL) — use as-is
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }

  if (url.startsWith('/api/images/')) {
    return url;
  }

  // Legacy key-only or wrong-domain paths — route through worker image proxy
  const productsIdx = url.indexOf('products/');
  if (productsIdx !== -1) {
    const key = url.slice(productsIdx);
    return `/api/images/${key}`;
  }

  if (url.startsWith('products/')) {
    return `/api/images/${url}`;
  }

  return url;
}

export const PLACEHOLDER_PHONE_IMAGE = '/assets/images/placeholder-phone.svg';

export function getPrimaryProductImage(product: Product | null | undefined): string | null {
  if (!product || !product.variants) return null;
  try {
    const variants = (typeof product.variants === 'string' 
      ? JSON.parse(product.variants) 
      : product.variants) as ProductVariant[];
    
    if (Array.isArray(variants)) {
      const withImages = variants.find(v => v.images && v.images.length > 0);
      if (withImages && withImages.images.length > 0) {
        return withImages.images[0];
      }
    }
  } catch {
    // ignore parse errors
  }
  return null;
}
