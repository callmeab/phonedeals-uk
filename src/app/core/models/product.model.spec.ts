import { normalizeProductCondition } from './product.model';

describe('normalizeProductCondition', () => {
  it('preserves a saved refurbished condition', () => {
    expect(normalizeProductCondition('refurbished')).toBe('refurbished');
  });

  it('preserves a both condition', () => {
    expect(normalizeProductCondition('both')).toBe('both');
  });

  it('treats actual refurbished details as refurbished even when the condition is stale', () => {
    expect(
      normalizeProductCondition('new', {
        availableGrades: ['like_new'],
        availableBatteryHealths: ['>90%'],
        boxIncluded: true,
        accessories: ['Charging cable'],
        notes: 'Tested'
      })
    ).toBe('refurbished');
  });

  it('treats refurbished variant metadata as refurbished even when the top-level condition is stale', () => {
    expect(
      normalizeProductCondition('new', null, [{
        color: 'Black',
        storage: '128GB',
        price: 499,
        stock: 1,
        condition: 'refurbished',
        grade: 'like_new',
        batteryHealth: '>90%',
        images: ['https://example.com/phone.jpg'],
        isActive: true
      }])
    ).toBe('refurbished');
  });

  it('defaults legacy or missing values to new', () => {
    expect(normalizeProductCondition(undefined)).toBe('new');
    expect(normalizeProductCondition('unknown' as any)).toBe('new');
  });
});
