import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import type { Readable } from 'node:stream';
import type { StorageEnv } from '../../common/config/env';
import { type PutObject, StoragePort } from './storage.port';

export type S3StorageConfig = Pick<
  StorageEnv,
  | 'S3_ENDPOINT'
  | 'S3_REGION'
  | 'S3_BUCKET'
  | 'S3_ACCESS_KEY_ID'
  | 'S3_SECRET_ACCESS_KEY'
  | 'S3_FORCE_PATH_STYLE'
  | 'S3_SERVER_SIDE_ENCRYPTION'
>;

// AWS SDK v3 against the managed EU bucket (prod) or MinIO (dev, tests).
// Objects are private: no ACL is ever sent, the bucket policy decides access.
@Injectable()
export class S3StorageAdapter extends StoragePort implements OnModuleDestroy {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: S3StorageConfig) {
    super();
    this.bucket = config.S3_BUCKET;
    this.client = new S3Client({
      region: config.S3_REGION,
      endpoint: config.S3_ENDPOINT,
      forcePathStyle: config.S3_FORCE_PATH_STYLE,
      credentials:
        config.S3_ACCESS_KEY_ID && config.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: config.S3_ACCESS_KEY_ID,
              secretAccessKey: config.S3_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }

  // Multipart upload in 5 MB parts: memory stays at queueSize × partSize.
  async putStream({ key, body, contentType }: PutObject): Promise<void> {
    await new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ServerSideEncryption: this.config.S3_SERVER_SIDE_ENCRYPTION,
      },
      queueSize: 2,
      partSize: 5 * 1024 * 1024,
      leavePartsOnError: false,
    }).done();
  }

  async getStream(key: string): Promise<Readable> {
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    // In Node the SDK body is an IncomingMessage, i.e. a Readable.
    return res.Body as Readable;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  onModuleDestroy(): void {
    this.client.destroy();
  }
}
