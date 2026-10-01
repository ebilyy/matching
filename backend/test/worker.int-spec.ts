import type { INestApplicationContext } from '@nestjs/common';
import { Server } from 'node:net';
import { createWorkerApp } from '../src/bootstrap';

describe('worker role', () => {
  let app: INestApplicationContext;
  let listen: jest.SpyInstance;

  beforeAll(async () => {
    process.env.APP_ROLE = 'worker';
    process.env.LOG_LEVEL = 'silent';
    listen = jest.spyOn(Server.prototype, 'listen');
    app = await createWorkerApp();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    listen.mockRestore();
  });

  // ADR-0003: the worker never opens an HTTP port.
  it('opens no listening socket', () => {
    expect(listen).not.toHaveBeenCalled();
  });

  it('is an application context, not an HTTP application', () => {
    expect('getHttpServer' in app).toBe(false);
  });
});
