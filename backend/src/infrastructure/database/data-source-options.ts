import type { DataSourceOptions } from 'typeorm';
import type { DatabaseEnv } from '../../common/config/env';
import { MIGRATIONS } from './migrations';

// Shared by the Nest app (DatabaseModule) and the migration CLI (data-source.ts).
export function buildDataSourceOptions(env: DatabaseEnv): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    migrations: MIGRATIONS,
    migrationsTransactionMode: 'each',
    // Schema comes only from the SQL pairs; the app never alters it.
    synchronize: false,
    migrationsRun: false,
  };
}
