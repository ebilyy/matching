import type { INestApplication, INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ApiModule } from './api.module';
import { ProblemFilter } from './common/errors/problem.filter';
import { createValidationPipe } from './common/validation/validation.pipe';
import { WorkerModule } from './worker.module';

export const API_PREFIX = 'api/v1';

export async function createApiApp(): Promise<INestApplication> {
  const app = await NestFactory.create(ApiModule.forRoot(), {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(API_PREFIX, { exclude: ['health'] });
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new ProblemFilter());
  app.enableShutdownHooks();
  return app;
}

export async function createWorkerApp(): Promise<INestApplicationContext> {
  const app = await NestFactory.createApplicationContext(
    WorkerModule.forRoot(),
    {
      bufferLogs: true,
    },
  );
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  return app;
}
