import type { DataSource } from 'typeorm';
import { SupplierEntity } from '../src/modules/suppliers/entities/suppliers.entity';
import { buildSupplier, createShop } from './fixtures';
import { createTestDatabase, dropTestDatabase } from './support/test-database';

// SupplierEntity ↔ suppliers table: the mapping round-trips through a real Postgres.
describe('SupplierEntity', () => {
  let ds: DataSource;
  let shopId: string;

  beforeAll(async () => {
    ds = await createTestDatabase('suppliers');
    shopId = (await createShop(ds)).id;
  });

  afterAll(async () => {
    await dropTestDatabase(ds);
  });

  it('persists the test supplier with its contact fields', async () => {
    const repo = ds.getRepository(SupplierEntity);
    const supplier = buildSupplier({ shopId });

    await repo.save(supplier);

    const loaded = await repo.findOneByOrFail({ id: supplier.id });
    expect(loaded).toMatchObject({
      shopId,
      name: 'Test Supplier',
      email: supplier.email,
      website: 'https://supplier.example.test',
      description: 'Test supplier for automated tests.',
      phone: '+380000000000',
      feedUrl: null,
      columnMapping: null,
      priceDate: null,
    });
    expect(loaded.createdAt).toBeInstanceOf(Date);
  });

  it('generates a UUID v7 id on save when none is given', async () => {
    const repo = ds.getRepository(SupplierEntity);
    const supplier = buildSupplier({ shopId });
    supplier.id = undefined as unknown as string;

    await repo.save(supplier);

    expect(supplier.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
