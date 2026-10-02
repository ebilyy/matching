import type { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { ManagerEntity } from '../../src/modules/managers/entities/manager.entity';
import type { ShopEntity } from '../../src/modules/shops/entities/shop.entity';

// shopId must point at an existing shop when the entity is persisted.
export function buildManager(
  overrides: Partial<ManagerEntity> = {},
): ManagerEntity {
  return Object.assign(new ManagerEntity(), {
    id: uuidv7(),
    shopId: uuidv7(),
    displayName: 'Test User',
    ...overrides,
  });
}

export async function createManager(
  ds: DataSource,
  shop: ShopEntity,
  opts: Partial<ManagerEntity> = {},
): Promise<ManagerEntity> {
  return ds
    .getRepository(ManagerEntity)
    .save(buildManager({ ...opts, shopId: shop.id }));
}
