import { Column, Entity, ForeignKey, Index, Unique } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { ManagerEntity } from '../../managers/entities/manager.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';
import {
  type ColumnMapping,
  SupplierEntity,
} from '../../suppliers/entities/suppliers.entity';
import { ImportKind, ImportSource, ImportStatus } from '../import.enums';

// Report shown in the UI: bad columns / rows (AC-03), schema differences (AC-04)
// or the feed refusal reason. Shape depends on status; filled from T10.
export type ImportIssues = Record<string, unknown>;

// One catalog or price file going through file-intake (ADR-0002, ADR-0003).
// Schema: migrations/20261001120004_create_imports. DESC ordering of the indexes
// lives in the SQL only; here they are declared by name for the drift check.
@Entity({ name: 'imports' })
@Unique('uq_imports_shop_id_id', ['shopId', 'id'])
@Unique('uq_imports_shop_id_idempotency_key', ['shopId', 'idempotencyKey'])
@ForeignKey(() => SupplierEntity, ['shopId', 'supplierId'], ['shopId', 'id'], {
  name: 'fk_imports_supplier',
})
@ForeignKey(() => ManagerEntity, ['shopId', 'managerId'], ['shopId', 'id'], {
  name: 'fk_imports_manager',
})
@Index('idx_imports_shop_id_created_at', ['shopId', 'createdAt'])
@Index(
  'idx_imports_shop_id_supplier_id',
  ['shopId', 'supplierId', 'createdAt'],
  { where: 'supplier_id IS NOT NULL' },
)
@Index('idx_imports_shop_id_manager_id', ['shopId', 'managerId'], {
  where: 'manager_id IS NOT NULL',
})
export class ImportEntity extends AbstractEntity {
  @Column({ name: 'shop_id', type: 'uuid' })
  @ForeignKey(() => ShopEntity, { name: 'imports_shop_id_fkey' })
  shopId: string;

  @Column({ name: 'kind', type: 'varchar', length: 16 })
  kind: ImportKind;

  @Column({ name: 'source', type: 'varchar', length: 16 })
  source: ImportSource;

  @Column({ name: 'status', type: 'varchar', length: 32 })
  status: ImportStatus;

  // NULL for kind = catalog.
  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId: string | null;

  // NULL: the system (scheduled feed).
  @Column({ name: 'manager_id', type: 'uuid', nullable: true })
  managerId: string | null;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  idempotencyKey: string | null;

  // S3 object key (ADR-0006). NULL when a feed was refused before the file was stored.
  @Column({
    name: 'storage_key',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  storageKey: string | null;

  @Column({
    name: 'original_filename',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  originalFilename: string | null;

  // Mapping this file was parsed with; for a catalog the only place it is stored.
  @Column({ name: 'column_mapping', type: 'jsonb', nullable: true })
  columnMapping: ColumnMapping | null;

  @Column({ name: 'issues', type: 'jsonb', nullable: true })
  issues: ImportIssues | null;

  @Column({ name: 'rows_recognized', type: 'integer', nullable: true })
  rowsRecognized: number | null;

  @Column({ name: 'auto_matched_count', type: 'integer', nullable: true })
  autoMatchedCount: number | null;

  @Column({ name: 'proposals_count', type: 'integer', nullable: true })
  proposalsCount: number | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt: Date | null;
}
