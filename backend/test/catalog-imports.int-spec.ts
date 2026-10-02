import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createApiApp } from '../src/bootstrap';
import { parseDatabaseEnv, parseEnv } from '../src/common/config/env';
import { buildDataSourceOptions } from '../src/infrastructure/database/data-source-options';
import { ENTITIES } from '../src/infrastructure/database/entities';
import { S3StorageAdapter } from '../src/infrastructure/storage/s3-storage.adapter';
import { ImportEntity } from '../src/modules/file-intake/entities/import.entity';
import { createShop } from './fixtures';
import { expectResponseToMatch } from './support/openapi';

// uploadCatalog + listImports / getImport against a throwaway database and the compose MinIO.
const env = parseDatabaseEnv(process.env);
const TEST_DB = `${env.DB_NAME}_catalog_imports_test`;
const MISSING = '0199a000-0000-7000-8000-0000000fffff';

const CSV = Buffer.from('Артикул;Назва\nSKU-1;Test product\n', 'utf8');
const MAPPING = JSON.stringify({
  columns: [
    { header: 'Артикул', role: 'sku' },
    { header: 'Назва', role: 'name' },
  ],
});

type Import = { id: string; status: string; original_filename: string };
type Page<T> = { items: T[] };
type Problem = { code: string; details?: Record<string, unknown> };
const bodyOf = <T>(res: request.Response): T => res.body as T;

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

describe('catalog upload API', () => {
  let app: INestApplication;
  let server: App;
  let ds: DataSource;
  let shopA: string;
  let shopB: string;
  const storage = new S3StorageAdapter(
    parseEnv({ ...process.env, APP_ROLE: 'api' }),
  );

  beforeAll(async () => {
    await withAdmin(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
    await withAdmin(`CREATE DATABASE ${TEST_DB}`);
    ds = new DataSource({
      ...buildDataSourceOptions({ ...env, DB_NAME: TEST_DB }),
      entities: ENTITIES,
    });
    await ds.initialize();
    await ds.runMigrations();
    shopA = (await createShop(ds)).id;
    shopB = (await createShop(ds)).id;

    process.env.APP_ROLE = 'api';
    process.env.LOG_LEVEL = 'silent';
    process.env.DB_NAME = TEST_DB;
    app = await createApiApp();
    await app.init();
    server = app.getHttpServer() as App;
  });

  afterAll(async () => {
    await app?.close();
    // Uploads land in the shared dev bucket; leave it as it was.
    const rows = (await ds?.getRepository(ImportEntity).find()) ?? [];
    await Promise.all(
      rows.flatMap((r) => (r.storageKey ? [storage.delete(r.storageKey)] : [])),
    );
    storage.onModuleDestroy();
    await ds?.destroy();
    process.env.DB_NAME = env.DB_NAME;
    await withAdmin(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  });

  const upload = (
    shopId: string,
    file: Buffer = CSV,
    filename = 'каталог.csv',
    mapping: string | null = MAPPING,
  ) => {
    const req = request(server)
      .post('/api/v1/catalog/imports')
      .set('Authorization', `Bearer ${shopId}`)
      .attach('file', file, filename);
    return mapping === null ? req : req.field('column_mapping', mapping);
  };

  it('stores the file and returns a queued import', async () => {
    const res = await upload(shopA).expect(202);
    expectResponseToMatch('uploadCatalog', res);
    const created = bodyOf<Import>(res);
    expect(created).toMatchObject({
      status: 'queued',
      original_filename: 'каталог.csv',
    });

    const row = await ds
      .getRepository(ImportEntity)
      .findOneByOrFail({ id: created.id });
    expect(row.storageKey).toBe(`${shopA}/${created.id}/каталог.csv`);
    const stored: Buffer[] = [];
    for await (const chunk of await storage.getStream(row.storageKey!)) {
      stored.push(chunk as Buffer);
    }
    expect(Buffer.concat(stored).equals(CSV)).toBe(true);

    const got = await request(server)
      .get(`/api/v1/imports/${created.id}`)
      .set('Authorization', `Bearer ${shopA}`)
      .expect(200);
    expectResponseToMatch('getImport', got);

    const list = await request(server)
      .get('/api/v1/imports')
      .set('Authorization', `Bearer ${shopA}`)
      .expect(200);
    expectResponseToMatch('listImports', list);
    expect(bodyOf<Page<Import>>(list).items[0].id).toBe(created.id);
  });

  it('lists imports newest first', async () => {
    const first = bodyOf<Import>(await upload(shopA).expect(202));
    const second = bodyOf<Import>(await upload(shopA).expect(202));
    const list = await request(server)
      .get('/api/v1/imports?limit=2')
      .set('Authorization', `Bearer ${shopA}`)
      .expect(200);
    expect(bodyOf<Page<Import>>(list).items.map((i) => i.id)).toEqual([
      second.id,
      first.id,
    ]);
  });

  it('hides another shop’s imports (AC-12)', async () => {
    const created = bodyOf<Import>(await upload(shopA).expect(202));
    const res = await request(server)
      .get(`/api/v1/imports/${created.id}`)
      .set('Authorization', `Bearer ${shopB}`)
      .expect(404);
    expectResponseToMatch('getImport', res);
    expect(bodyOf<Problem>(res).code).toBe('import.not_found');

    const list = await request(server)
      .get('/api/v1/imports')
      .set('Authorization', `Bearer ${shopB}`)
      .expect(200);
    expect(bodyOf<Page<Import>>(list).items).toEqual([]);
  });

  it('rejects a file that is not XLSX or CSV with 415', async () => {
    const res = await upload(shopA, CSV, 'notes.txt').expect(415);
    expectResponseToMatch('uploadCatalog', res);
    expect(bodyOf<Problem>(res).code).toBe('import.unsupported_media_type');
  });

  it('rejects a file over 50 MB with 413', async () => {
    const big = Buffer.alloc(50 * 1024 * 1024 + 1, 0x41);
    const res = await upload(shopA, big, 'big.csv').expect(413);
    expectResponseToMatch('uploadCatalog', res);
    expect(bodyOf<Problem>(res).code).toBe('import.file_too_large');
  }, 30_000);

  it('rejects a mapping without sku with 422 invalid_column_mapping', async () => {
    const mapping = JSON.stringify({
      columns: [{ header: 'Назва', role: 'name' }],
    });
    const res = await upload(shopA, CSV, 'c.csv', mapping).expect(422);
    expectResponseToMatch('uploadCatalog', res);
    expect(bodyOf<Problem>(res)).toMatchObject({
      code: 'import.invalid_column_mapping',
      details: { missing_roles: ['sku'] },
    });
  });

  it('requires column_mapping and file', async () => {
    const noMapping = await upload(shopA, CSV, 'c.csv', null).expect(422);
    expect(bodyOf<Problem>(noMapping).code).toBe('common.validation_failed');

    const noFile = await request(server)
      .post('/api/v1/catalog/imports')
      .set('Authorization', `Bearer ${shopA}`)
      .field('column_mapping', MAPPING)
      .expect(422);
    expect(bodyOf<Problem>(noFile).code).toBe('common.validation_failed');
  });

  it('requires a credential', async () => {
    const res = await request(server)
      .post('/api/v1/catalog/imports')
      .attach('file', CSV, 'c.csv')
      .expect(401);
    expectResponseToMatch('uploadCatalog', res);
  });

  it('answers 404 for an unknown import', async () => {
    await request(server)
      .get(`/api/v1/imports/${MISSING}`)
      .set('Authorization', `Bearer ${shopA}`)
      .expect(404);
  });
});
