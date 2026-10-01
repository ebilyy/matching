import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { Logger } from 'nestjs-pino';
import { createApiApp, createWorkerApp } from './bootstrap';
import { parseEnv } from './common/config/env';

async function main(): Promise<void> {
  // Local runs outside compose; never overrides variables already set.
  if (existsSync('.env')) process.loadEnvFile('.env');
  const env = parseEnv(process.env);

  if (env.APP_ROLE === 'api') {
    const app = await createApiApp();
    await app.listen(env.PORT, '0.0.0.0');
    app.get(Logger).log(`api listening on :${env.PORT}`, 'Bootstrap');
    return;
  }

  const app = await createWorkerApp();
  await app.init();
  app.get(Logger).log('worker started (no HTTP listener)', 'Bootstrap');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
