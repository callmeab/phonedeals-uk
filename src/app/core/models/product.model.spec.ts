import { normalizeProductCondition } from './product.model';

describe('normalizeProductCondition', () => {
  it('preserves a saved refurbished condition', () => {
    expect(normalizeProductCondition('refurbished')).toBe('refurbished');
  });

  it('preserves a both condition', () => {
    expect(normalizeProductCondition('both')).toBe('both');
  });

  it('defaults legacy or missing values to new', () => {
    expect(normalizeProductCondition(undefined)).toBe('new');
    expect(normalizeProductCondition('unknown' as any)).toBe('new');
  });
});
