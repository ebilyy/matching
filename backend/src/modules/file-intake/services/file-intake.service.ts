import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream } from 'node:fs';
import type { Repository } from 'typeorm';
import { newId } from '../../../common/ids/new-id';
import {
  importObjectKey,
  StoragePort,
} from '../../../infrastructure/storage/storage.port';
import type { ColumnMapping } from '../../suppliers/entities/suppliers.entity';
import { ImportEntity } from '../entities/import.entity';
import { ImportKind, ImportSource, ImportStatus } from '../import.enums';

// The part of a multer file the intake needs: the upload is spooled to disk first.
export type SpooledFile = Pick<
  Express.Multer.File,
  'path' | 'originalname' | 'mimetype'
>;

export type AcceptUpload = {
  shopId: string;
  kind: ImportKind;
  file: SpooledFile;
  columnMapping: ColumnMapping;
  supplierId?: string | null;
  managerId?: string | null;
};

// Shared intake for catalog and price files (ADR-0002, SAD §6 flow 1 steps 1–5).
// TODO(T08): 30/h rate limit and Idempotency-Key replay; TODO(T06): enqueue the
// import job in the same transaction as the row.
@Injectable()
export class FileIntakeService {
  private readonly logger = new Logger(FileIntakeService.name);

  constructor(
    @InjectRepository(ImportEntity)
    private readonly imports: Repository<ImportEntity>,
    private readonly storage: StoragePort,
  ) {}

  async accept(upload: AcceptUpload): Promise<ImportEntity> {
    const id = newId();
    const storageKey = importObjectKey(
      upload.shopId,
      id,
      upload.file.originalname,
    );
    await this.storage.putStream({
      key: storageKey,
      body: createReadStream(upload.file.path),
      contentType: upload.file.mimetype,
    });
    try {
      return await this.imports.save(
        this.imports.create({
          id,
          shopId: upload.shopId,
          kind: upload.kind,
          source: ImportSource.Upload,
          status: ImportStatus.Queued,
          supplierId: upload.supplierId ?? null,
          managerId: upload.managerId ?? null,
          idempotencyKey: null,
          storageKey,
          originalFilename: upload.file.originalname.slice(0, 255),
          columnMapping: upload.columnMapping,
          issues: null,
          rowsRecognized: null,
          autoMatchedCount: null,
          proposalsCount: null,
          startedAt: null,
          finishedAt: null,
        }),
      );
    } catch (error) {
      // No row → nobody will ever read the object; the 30-day lifecycle is the backstop.
      await this.storage.delete(storageKey).catch((cleanup: unknown) => {
        this.logger.warn({ storageKey, err: cleanup }, 'orphan upload left');
      });
      throw error;
    }
  }
}
