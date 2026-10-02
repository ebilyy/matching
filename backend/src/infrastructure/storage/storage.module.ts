import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../common/config/env';
import { S3StorageAdapter } from './s3-storage.adapter';
import { StoragePort } from './storage.port';

// Both roles: api stores uploads, worker reads them back (T09).
@Global()
@Module({
  providers: [
    {
      provide: StoragePort,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new S3StorageAdapter({
          S3_ENDPOINT: config.get('S3_ENDPOINT', { infer: true }),
          S3_REGION: config.get('S3_REGION', { infer: true }),
          S3_BUCKET: config.get('S3_BUCKET', { infer: true }),
          S3_ACCESS_KEY_ID: config.get('S3_ACCESS_KEY_ID', { infer: true }),
          S3_SECRET_ACCESS_KEY: config.get('S3_SECRET_ACCESS_KEY', {
            infer: true,
          }),
          S3_FORCE_PATH_STYLE: config.get('S3_FORCE_PATH_STYLE', {
            infer: true,
          }),
          S3_SERVER_SIDE_ENCRYPTION: config.get('S3_SERVER_SIDE_ENCRYPTION', {
            infer: true,
          }),
        }),
    },
  ],
  exports: [StoragePort],
})
export class StorageModule {}
