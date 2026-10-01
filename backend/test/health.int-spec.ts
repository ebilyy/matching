import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createApiApp } from '../src/bootstrap';
import { expectResponseToMatch } from './support/openapi';

describe('api role: GET /health', () => {
  let app: INestApplication;
  let server: App;

  beforeAll(async () => {
    process.env.APP_ROLE = 'api';
    process.env.LOG_LEVEL = 'silent';
    app = await createApiApp();
    await app.init();
    server = app.getHttpServer() as App;
  });

  afterAll(() => app.close());

  it('answers 200 per getHealth in openapi.yaml', async () => {
    const res = await request(server).get('/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
    expectResponseToMatch('getHealth', res);
  });

  it('is not under the /api/v1 prefix', async () => {
    await request(server).get('/api/v1/health').expect(404);
  });

  it('echoes a valid X-Request-Id and mints one otherwise', async () => {
    const echoed = await request(server)
      .get('/health')
      .set('X-Request-Id', 'req-42');
    expect(echoed.headers['x-request-id']).toBe('req-42');

    const minted = await request(server).get('/health');
    expect(minted.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });
});
