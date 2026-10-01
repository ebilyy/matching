import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { parseDatabaseEnv } from '../../common/config/env';
import { buildDataSourceOptions } from './data-source-options';

// Entry point for the TypeORM CLI only (npm run migration:*). The app builds
// its connection in DatabaseModule.
if (existsSync('.env')) process.loadEnvFile('.env');

export default new DataSource(
  buildDataSourceOptions(parseDatabaseEnv(process.env)),
);
