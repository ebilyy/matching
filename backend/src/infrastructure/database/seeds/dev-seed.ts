import type { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
import { ManagerEntity } from '../../../modules/managers/entities/manager.entity';
import { ShopEntity } from '../../../modules/shops/entities/shop.entity';
import { SupplierEntity } from '../../../modules/suppliers/entities/suppliers.entity';

// Local dev data with fixed UUID v7 ids, so other rows can reference them.
// Not a migration: test data never goes into migrations/ (rules/migrations.md → Seeds).
// Two shops so tenant isolation (ADR-0008) can be tried by hand.
export const DEV_SEED = {
  shops: {
    a: '0199a000-0000-7000-8000-00000000a001',
    b: '0199a000-0000-7000-8000-00000000b001',
  },
  managers: {
    a: '0199a000-0000-7000-8000-00000000a101',
    b: '0199a000-0000-7000-8000-00000000b101',
  },
  suppliers: {
    a: '0199a000-0000-7000-8000-00000000a201',
    b: '0199a000-0000-7000-8000-00000000b201',
  },
} as const;

const SHOPS: Partial<ShopEntity>[] = [
  { id: DEV_SEED.shops.a, name: 'Test Shop A' },
  { id: DEV_SEED.shops.b, name: 'Test Shop B' },
];

const MANAGERS: Partial<ManagerEntity>[] = [
  {
    id: DEV_SEED.managers.a,
    shopId: DEV_SEED.shops.a,
    displayName: 'Test User A',
  },
  {
    id: DEV_SEED.managers.b,
    shopId: DEV_SEED.shops.b,
    displayName: 'Test User B',
  },
];

const SUPPLIERS: Partial<SupplierEntity>[] = [
  {
    id: DEV_SEED.suppliers.a,
    shopId: DEV_SEED.shops.a,
    name: 'Test Supplier A',
    email: 'supplier-a@example.test',
    website: 'https://supplier-a.example.test',
    description: 'Dev seed supplier of Test Shop A.',
    phone: '+380000000001',
  },
  {
    id: DEV_SEED.suppliers.b,
    shopId: DEV_SEED.shops.b,
    name: 'Test Supplier B',
    email: 'supplier-b@example.test',
    website: 'https://supplier-b.example.test',
    description: 'Dev seed supplier of Test Shop B.',
    phone: '+380000000002',
  },
];

// Idempotent: ON CONFLICT DO NOTHING, so re-running keeps existing rows untouched.
export async function runDevSeed(ds: DataSource): Promise<void> {
  await ds.transaction(async (em) => {
    const insert = (
      target: EntityTarget<ObjectLiteral>,
      rows: ObjectLiteral[],
    ) =>
      em
        .createQueryBuilder()
        .insert()
        .into(target)
        .values(rows)
        .orIgnore()
        .execute();

    await insert(ShopEntity, SHOPS);
    await insert(ManagerEntity, MANAGERS);
    await insert(SupplierEntity, SUPPLIERS);
  });
}
