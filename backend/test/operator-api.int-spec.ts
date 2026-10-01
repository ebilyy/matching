import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createApiApp } from '../src/bootstrap';
import { parseDatabaseEnv } from '../src/common/config/env';
import { buildDataSourceOptions } from '../src/infrastructure/database/data-source-options';
import { expectResponseToMatch } from './support/openapi';

// Operator endpoints for shops and managers (openapi tag `operator`), against a throwaway database.
const env = parseDatabaseEnv(process.env);
const TEST_DB = `${env.DB_NAME}_operator_api_test`;
const MISSING = '0199a000-0000-7000-8000-0000000fffff';

type Shop = { id: string; name: string; created_at: string };
type Manager = { id: string; shop_id: string; display_name: string };
type Page<T> = {
  items: T[];
  has_next: boolean;
  has_prev: boolean;
  next_cursor: string | null;
  prev_cursor: string | null;
};
type Problem = {
  code: string;
  details: { fields: { field: string; problem: string }[] };
};

// supertest types `body` as any; the contract check runs before the cast is trusted.
const bodyOf = <T>(res: request.Response): T => res.body as T;
const idsOf = (page: Page<{ id: string }>) => page.items.map((s) => s.id);

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

describe('operator API: shops and managers', () => {
  let app: INestApplication;
  let server: App;

  beforeAll(async () => {
    await withAdmin(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
    await withAdmin(`CREATE DATABASE ${TEST_DB}`);
    const ds = new DataSource(
      buildDataSourceOptions({ ...env, DB_NAME: TEST_DB }),
    );
    await ds.initialize();
    await ds.runMigrations();
    await ds.destroy();

    process.env.APP_ROLE = 'api';
    process.env.LOG_LEVEL = 'silent';
    process.env.DB_NAME = TEST_DB;
    app = await createApiApp();
    await app.init();
    server = app.getHttpServer() as App;
  });

  afterAll(async () => {
    await app?.close();
    process.env.DB_NAME = env.DB_NAME;
    await withAdmin(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
  });

  const createShop = async (name: string) =>
    bodyOf<Shop>(
      await request(server).post('/api/v1/shops').send({ name }).expect(201),
    );

  describe('shops', () => {
    it('creates, gets and renames a shop', async () => {
      const created = await request(server)
        .post('/api/v1/shops')
        .send({ name: 'Test Shop' })
        .expect(201);
      expectResponseToMatch('createShop', created);
      expect(bodyOf<Shop>(created).id).toMatch(/^[0-9a-f-]{14}7/);

      const got = await request(server)
        .get(`/api/v1/shops/${bodyOf<Shop>(created).id}`)
        .expect(200);
      expectResponseToMatch('getShop', got);
      expect(got.body).toEqual(created.body);

      const renamed = await request(server)
        .patch(`/api/v1/shops/${bodyOf<Shop>(created).id}`)
        .send({ name: 'Test Shop Renamed' })
        .expect(200);
      expectResponseToMatch('updateShop', renamed);
      expect(bodyOf<Shop>(renamed).name).toBe('Test Shop Renamed');
    });

    it('pages through shops with opaque cursors both ways', async () => {
      for (const n of [1, 2, 3]) await createShop(`Paged Shop ${n}`);

      const all = await request(server)
        .get('/api/v1/shops?limit=100')
        .expect(200);
      const ids = idsOf(bodyOf<Page<Shop>>(all));
      expect(ids).toEqual([...ids].sort());

      const first = await request(server)
        .get('/api/v1/shops?limit=2')
        .expect(200);
      expectResponseToMatch('listShops', first);
      expect(first.body).toMatchObject({
        has_next: true,
        has_prev: false,
        prev_cursor: null,
      });
      expect(idsOf(bodyOf<Page<Shop>>(first))).toEqual(ids.slice(0, 2));

      const second = await request(server)
        .get(
          `/api/v1/shops?limit=2&after=${bodyOf<Page<Shop>>(first).next_cursor}`,
        )
        .expect(200);
      expect(bodyOf<Page<Shop>>(second).has_prev).toBe(true);
      expect(idsOf(bodyOf<Page<Shop>>(second))).toEqual(ids.slice(2, 4));

      const back = await request(server)
        .get(
          `/api/v1/shops?limit=2&before=${bodyOf<Page<Shop>>(second).prev_cursor}`,
        )
        .expect(200);
      expect(bodyOf<Page<Shop>>(back).items).toEqual(
        bodyOf<Page<Shop>>(first).items,
      );
      expect(bodyOf<Page<Shop>>(back).has_prev).toBe(false);
    });

    it('answers 404 shop.not_found for an unknown shop', async () => {
      const res = await request(server)
        .get(`/api/v1/shops/${MISSING}`)
        .expect(404);
      expectResponseToMatch('getShop', res);
      expect(bodyOf<Problem>(res).code).toBe('shop.not_found');
    });

    it('answers 422 for an invalid body, path id or cursor', async () => {
      const body = await request(server)
        .post('/api/v1/shops')
        .send({ name: '' })
        .expect(422);
      expectResponseToMatch('createShop', body);
      expect(bodyOf<Problem>(body).details.fields[0].field).toBe('name');

      const extra = await request(server)
        .post('/api/v1/shops')
        .send({ name: 'Test Shop', shop_id: MISSING })
        .expect(422);
      expect(bodyOf<Problem>(extra).code).toBe('common.validation_failed');

      const id = await request(server)
        .get('/api/v1/shops/not-a-uuid')
        .expect(422);
      expectResponseToMatch('getShop', id);

      const cursor = await request(server)
        .get('/api/v1/shops?after=garbage')
        .expect(422);
      expectResponseToMatch('listShops', cursor);

      const limit = await request(server)
        .get('/api/v1/shops?limit=101')
        .expect(422);
      expect(bodyOf<Problem>(limit).details.fields[0].field).toBe('limit');
    });
  });

  describe('managers', () => {
    it('creates, lists, gets and renames a manager of a shop', async () => {
      const shop = await createShop('Test Shop');
      const base = `/api/v1/shops/${shop.id}/managers`;

      const created = await request(server)
        .post(base)
        .send({ display_name: 'Test User' })
        .expect(201);
      expectResponseToMatch('createManager', created);
      expect(bodyOf<Manager>(created).shop_id).toBe(shop.id);

      const list = await request(server).get(base).expect(200);
      expectResponseToMatch('listManagers', list);
      expect(bodyOf<Page<Manager>>(list).items).toEqual([
        bodyOf<Manager>(created),
      ]);

      const got = await request(server)
        .get(`${base}/${bodyOf<Manager>(created).id}`)
        .expect(200);
      expectResponseToMatch('getManager', got);

      const renamed = await request(server)
        .patch(`${base}/${bodyOf<Manager>(created).id}`)
        .send({ display_name: 'Test User Renamed' })
        .expect(200);
      expectResponseToMatch('updateManager', renamed);
      expect(bodyOf<Manager>(renamed).display_name).toBe('Test User Renamed');
    });

    it("does not reveal another shop's manager (AC-12)", async () => {
      const a = await createShop('Test Shop A');
      const b = await createShop('Test Shop B');
      const manager = bodyOf<Manager>(
        await request(server)
          .post(`/api/v1/shops/${a.id}/managers`)
          .send({ display_name: 'Test User' })
          .expect(201),
      );

      const res = await request(server)
        .get(`/api/v1/shops/${b.id}/managers/${manager.id}`)
        .expect(404);
      expectResponseToMatch('getManager', res);
      expect(bodyOf<Problem>(res).code).toBe('manager.not_found');

      const list = await request(server)
        .get(`/api/v1/shops/${b.id}/managers`)
        .expect(200);
      expect(bodyOf<Page<Manager>>(list).items).toEqual([]);
    });

    it('answers 404 shop.not_found when the shop does not exist', async () => {
      const res = await request(server)
        .post(`/api/v1/shops/${MISSING}/managers`)
        .send({ display_name: 'Test User' })
        .expect(404);
      expectResponseToMatch('createManager', res);
      expect(bodyOf<Problem>(res).code).toBe('shop.not_found');
    });
  });
});
