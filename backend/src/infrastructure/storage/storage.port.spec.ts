import { importObjectKey } from './storage.port';

describe('importObjectKey', () => {
  const shop = '0199a000-0000-7000-8000-000000000001';
  const imp = '0199a000-0000-7000-8000-000000000002';

  it('namespaces the object by shop and import', () => {
    expect(importObjectKey(shop, imp, 'каталог.xlsx')).toBe(
      `${shop}/${imp}/каталог.xlsx`,
    );
  });

  it('keeps only the last path segment of the filename', () => {
    expect(importObjectKey(shop, imp, '../../other-shop/x.csv')).toBe(
      `${shop}/${imp}/x.csv`,
    );
    expect(importObjectKey(shop, imp, 'C:\\tmp\\price.csv')).toBe(
      `${shop}/${imp}/price.csv`,
    );
  });

  it('falls back to a fixed name when nothing is left', () => {
    expect(importObjectKey(shop, imp, '\u0000/')).toBe(`${shop}/${imp}/upload`);
  });
});
