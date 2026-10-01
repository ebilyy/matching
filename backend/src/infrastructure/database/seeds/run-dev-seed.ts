import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { parseDatabaseEnv } from '../../../common/config/env';
import { ManagerEntity } from '../../../modules/managers/entities/manager.entity';
import { ShopEntity } from '../../../modules/shops/entities/shop.entity';
import { SupplierEntity } from '../../../modules/suppliers/entities/suppliers.entity';
import { buildDataSourceOptions } from '../data-source-options';
import { runDevSeed } from './dev-seed';

// Entry point for `npm run seed:dev`. Run after `npm run migration:run`.
if (existsSync('.env')) process.loadEnvFile('.env');

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Dev seed refuses to run with NODE_ENV=production');
  }
  const ds = new DataSource({
    ...buildDataSourceOptions(parseDatabaseEnv(process.env)),
    entities: [ShopEntity, ManagerEntity, SupplierEntity],
  });
  await ds.initialize();
  try {
    await runDevSeed(ds);
  } finally {
    await ds.destroy();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
