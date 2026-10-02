import { DataSource } from 'typeorm';
import { parseDatabaseEnv } from '../../src/common/config/env';
import { buildDataSourceOptions } from '../../src/infrastructure/database/data-source-options';
import { ENTITIES } from '../../src/infrastructure/database/entities';

const env = parseDatabaseEnv(process.env);

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

// Throwaway database `<DB_NAME>_<suffix>_test`, migrated, with every entity mapped.
// Each spec file uses its own suffix so files never share state.
export async function createTestDatabase(suffix: string): Promise<DataSource> {
  const name = `${env.DB_NAME}_${suffix}_test`;
  await withAdmin(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  await withAdmin(`CREATE DATABASE ${name}`);
  const ds = new DataSource({
    ...buildDataSourceOptions({ ...env, DB_NAME: name }),
    entities: ENTITIES,
  });
  await ds.initialize();
  await ds.runMigrations();
  return ds;
}

export async function dropTestDatabase(
  ds: DataSource | undefined,
): Promise<void> {
  if (!ds) return;
  const name = ds.options.database as string;
  await ds.destroy();
  await withAdmin(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
}
