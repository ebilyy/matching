import { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { parseDatabaseEnv } from '../src/common/config/env';
import { buildDataSourceOptions } from '../src/infrastructure/database/data-source-options';
import { SupplierEntity } from '../src/modules/suppliers/entities/suppliers.entity';
import { buildSupplier } from './fixtures/suppliers.fixture';

// SupplierEntity ↔ suppliers table: the mapping round-trips through a real Postgres.
const env = parseDatabaseEnv(process.env);
const TEST_DB = `${env.DB_NAME}_suppliers_test`;

async function withAdmin(sql: string): Promise<void> {
  const admin = new DataSource({
    ...buildDataSourceOptions(env),
    migrations: [],
  });
  await admin.initialize();
  try {
    await admin.query(sql);
  } finally {
    await admin.destroy();
  }
}

describe('SupplierEntity', () => {
  let ds: DataSource;
  let shopId: string;

  beforeAll(async () => {
    await withAdmin(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
    await withAdmin(`CREATE DATABASE ${TEST_DB}`);
    ds = new DataSource({
      ...buildDataSourceOptions({ ...env, DB_NAME: TEST_DB }),
      entities: [SupplierEntity],
    });
    await ds.initialize();
    await ds.runMigrations();
    shopId = uuidv7();
    await ds.query(`INSERT INTO shops (id, name) VALUES ($1, 'Test Shop')`, [
      shopId,
    ]);
  });

  afterAll(async () => {
    await ds?.destroy();
    await withAdmin(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
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
