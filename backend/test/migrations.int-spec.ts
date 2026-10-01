import { DataSource } from 'typeorm';
import { parseDatabaseEnv } from '../src/common/config/env';
import { buildDataSourceOptions } from '../src/infrastructure/database/data-source-options';
import { MIGRATIONS } from '../src/infrastructure/database/migrations';
import { readSqlMigration } from '../src/infrastructure/database/sql-file-migration';

// T02 roundtrip on a throwaway database: up → up again → down ×N → up.
const EXPECTED_TABLES = 10;
const EXPECTED_INDEXES = 33;

const env = parseDatabaseEnv(process.env);
const TEST_DB = `${env.DB_NAME}_migrations_test`;

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

async function schemaCounts(ds: DataSource) {
  const [row] = await ds.query<{ tables: number; indexes: number }[]>(`
    SELECT
      (SELECT count(*) FROM pg_tables
        WHERE schemaname = 'public' AND tablename <> 'migrations')::int AS tables,
      (SELECT count(*) FROM pg_indexes
        WHERE schemaname = 'public' AND tablename <> 'migrations')::int AS indexes
  `);
  return row;
}

describe('SQL migrations roundtrip', () => {
  let ds: DataSource;

  beforeAll(async () => {
    await withAdmin(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
    await withAdmin(`CREATE DATABASE ${TEST_DB}`);
    ds = new DataSource(buildDataSourceOptions({ ...env, DB_NAME: TEST_DB }));
    await ds.initialize();
  });

  afterAll(async () => {
    await ds?.destroy();
    await withAdmin(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  });

  it('up creates every table and index', async () => {
    const applied = await ds.runMigrations();
    expect(applied).toHaveLength(MIGRATIONS.length);
    expect(await schemaCounts(ds)).toEqual({
      tables: EXPECTED_TABLES,
      indexes: EXPECTED_INDEXES,
    });
  });

  it('up files are idempotent when replayed', async () => {
    for (const migration of ds.migrations) {
      const pair = (migration as unknown as { pair: string }).pair;
      await ds.query(readSqlMigration(`${pair}.up.sql`));
    }
    expect(await schemaCounts(ds)).toEqual({
      tables: EXPECTED_TABLES,
      indexes: EXPECTED_INDEXES,
    });
  });

  it('down reverts every pair', async () => {
    for (let i = 0; i < MIGRATIONS.length; i++) {
      await ds.undoLastMigration();
    }
    expect(await ds.showMigrations()).toBe(true);
    expect(await schemaCounts(ds)).toEqual({ tables: 0, indexes: 0 });
  });

  it('up applies cleanly again after a full revert', async () => {
    await ds.runMigrations();
    expect(await schemaCounts(ds)).toEqual({
      tables: EXPECTED_TABLES,
      indexes: EXPECTED_INDEXES,
    });
  });
});
