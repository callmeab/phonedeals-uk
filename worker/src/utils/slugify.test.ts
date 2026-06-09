import { describe, it, expect } from 'vitest';

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

describe('slugify', () => {
  it('should convert normal strings to lowercase with hyphens', () => {
    expect(slugify('iPhone 16 Pro Max')).toBe('iphone-16-pro-max');
    expect(slugify('Samsung Galaxy S24')).toBe('samsung-galaxy-s24');
  });

  it('should handle special characters', () => {
    expect(slugify('iPhone 15 Pro (128GB)')).toBe('iphone-15-pro-128gb');
    expect(slugify('Buy Now & Save! ')).toBe('buy-now-save');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('iPhone   14    Plus')).toBe('iphone-14-plus');
  });

  it('should trim hyphens from ends', () => {
    expect(slugify('-Test Product-')).toBe('test-product');
  });
});
