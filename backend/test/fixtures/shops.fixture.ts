import type { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { ShopEntity } from '../../src/modules/shops/entities/shop.entity';

export function buildShop(overrides: Partial<ShopEntity> = {}): ShopEntity {
  return Object.assign(new ShopEntity(), {
    id: uuidv7(),
    name: 'Test Shop',
    ...overrides,
  });
}

export async function createShop(
  ds: DataSource,
  opts: Partial<ShopEntity> = {},
): Promise<ShopEntity> {
  return ds.getRepository(ShopEntity).save(buildShop(opts));
}
