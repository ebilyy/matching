import { DataSource } from 'typeorm';
import { parseDatabaseEnv } from '../src/common/config/env';
import { buildDataSourceOptions } from '../src/infrastructure/database/data-source-options';
import {
  DEV_SEED,
  runDevSeed,
} from '../src/infrastructure/database/seeds/dev-seed';
import { ManagerEntity } from '../src/modules/managers/entities/manager.entity';
import { ShopEntity } from '../src/modules/shops/entities/shop.entity';
import { SupplierEntity } from '../src/modules/suppliers/entities/suppliers.entity';
import { buildManager } from './fixtures/managers.fixture';
import { buildShop } from './fixtures/shops.fixture';

const env = parseDatabaseEnv(process.env);
const TEST_DB = `${env.DB_NAME}_dev_seed_test`;

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

describe('dev seed', () => {
  let ds: DataSource;

  beforeAll(async () => {
    await withAdmin(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
    await withAdmin(`CREATE DATABASE ${TEST_DB}`);
    ds = new DataSource({
      ...buildDataSourceOptions({ ...env, DB_NAME: TEST_DB }),
      entities: [ShopEntity, ManagerEntity, SupplierEntity],
    });
    await ds.initialize();
    await ds.runMigrations();
  });

  afterAll(async () => {
    await ds?.destroy();
    await withAdmin(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  });

  it('creates two shops, each with a manager and a supplier, and is idempotent', async () => {
    await runDevSeed(ds);
    await runDevSeed(ds);

    expect(await ds.getRepository(ShopEntity).count()).toBe(2);
    expect(await ds.getRepository(ManagerEntity).count()).toBe(2);
    expect(await ds.getRepository(SupplierEntity).count()).toBe(2);
    expect(
      await ds
        .getRepository(SupplierEntity)
        .findOneByOrFail({ id: DEV_SEED.suppliers.a }),
    ).toMatchObject({ shopId: DEV_SEED.shops.a, name: 'Test Supplier A' });
  });

  it('shop and manager fixtures persist through their entities', async () => {
    const shop = await ds.getRepository(ShopEntity).save(buildShop());
    const manager = await ds
      .getRepository(ManagerEntity)
      .save(buildManager({ shopId: shop.id }));

    expect(
      await ds.getRepository(ManagerEntity).findOneByOrFail({ id: manager.id }),
    ).toMatchObject({ shopId: shop.id, displayName: 'Test User' });
  });
});
