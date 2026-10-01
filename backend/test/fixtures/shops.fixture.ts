import { v7 as uuidv7 } from 'uuid';
import { ShopEntity } from '../../src/modules/shops/entities/shop.entity';

export function buildShop(overrides: Partial<ShopEntity> = {}): ShopEntity {
  return Object.assign(new ShopEntity(), {
    id: uuidv7(),
    name: 'Test Shop',
    ...overrides,
  });
}
