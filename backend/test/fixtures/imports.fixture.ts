import type { DataSource } from 'typeorm';
import { newId } from '../../src/common/ids/new-id';
import { ImportEntity } from '../../src/modules/file-intake/entities/import.entity';
import {
  ImportKind,
  ImportSource,
  ImportStatus,
} from '../../src/modules/file-intake/import.enums';
import type { ShopEntity } from '../../src/modules/shops/entities/shop.entity';

// Defaults to a queued catalog upload; pass supplierId + kind: Price for a price import.
export async function createImport(
  ds: DataSource,
  shop: ShopEntity,
  opts: Partial<ImportEntity> = {},
): Promise<ImportEntity> {
  const id = opts.id ?? newId();
  const row = Object.assign(new ImportEntity(), {
    id,
    kind: ImportKind.Catalog,
    source: ImportSource.Upload,
    status: ImportStatus.Queued,
    supplierId: null,
    managerId: null,
    idempotencyKey: null,
    storageKey: `imports/${id}`,
    originalFilename: 'test-catalog.xlsx',
    columnMapping: null,
    issues: null,
    rowsRecognized: null,
    autoMatchedCount: null,
    proposalsCount: null,
    startedAt: null,
    finishedAt: null,
    ...opts,
    shopId: shop.id,
  });
  return ds.getRepository(ImportEntity).save(row);
}
