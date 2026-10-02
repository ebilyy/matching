import { Column, Entity, ForeignKey, Index, Unique } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { OwnProductEntity } from '../../catalog/entities/own-product.entity';
import { ImportEntity } from '../../file-intake/entities/import.entity';
import { ManagerEntity } from '../../managers/entities/manager.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';
import { SupplierPositionEntity } from '../../suppliers/entities/supplier-position.entity';
import { MatchEventType } from '../match-ledger.enums';

// Event body: explanation (matched code, changed fingerprint parts, confidence).
// Shape is per type + schema_version; old versions go through upcasters (SAD §8).
export type MatchEventPayload = Record<string, unknown>;

// Append-only source of truth for matches and decisions (ADR-0004). A stream is the
// pair (shop_id, own_product_id, supplier_position_id); the unique stream version is
// the optimistic-concurrency guard (→ 409). Written only by match-ledger (ADR-0007).
// Schema: migrations/20261001120006_create_match_events.
@Entity({ name: 'match_events' })
@Unique('uq_match_events_stream_version', [
  'shopId',
  'ownProductId',
  'supplierPositionId',
  'streamVersion',
])
@ForeignKey(
  () => OwnProductEntity,
  ['shopId', 'ownProductId'],
  ['shopId', 'id'],
  { name: 'fk_match_events_own_product' },
)
@ForeignKey(
  () => SupplierPositionEntity,
  ['shopId', 'supplierPositionId'],
  ['shopId', 'id'],
  { name: 'fk_match_events_supplier_position' },
)
@ForeignKey(() => ManagerEntity, ['shopId', 'managerId'], ['shopId', 'id'], {
  name: 'fk_match_events_manager',
})
@ForeignKey(() => ImportEntity, ['shopId', 'importId'], ['shopId', 'id'], {
  name: 'fk_match_events_import',
})
@Index('idx_match_events_shop_id_supplier_position_id', [
  'shopId',
  'supplierPositionId',
])
@Index('idx_match_events_shop_id_manager_id', ['shopId', 'managerId'], {
  where: 'manager_id IS NOT NULL',
})
@Index('idx_match_events_shop_id_import_id', ['shopId', 'importId'], {
  where: 'import_id IS NOT NULL',
})
export class MatchEventEntity extends AbstractEntity {
  @Column({ name: 'shop_id', type: 'uuid' })
  @ForeignKey(() => ShopEntity, { name: 'match_events_shop_id_fkey' })
  shopId: string;

  @Column({ name: 'own_product_id', type: 'uuid' })
  ownProductId: string;

  @Column({ name: 'supplier_position_id', type: 'uuid' })
  supplierPositionId: string;

  @Column({ name: 'stream_version', type: 'integer' })
  streamVersion: number;

  @Column({ name: 'type', type: 'varchar', length: 64 })
  type: MatchEventType;

  @Column({ name: 'schema_version', type: 'smallint' })
  schemaVersion: number;

  // NULL: the system (auto-match, scheduled feed).
  @Column({ name: 'manager_id', type: 'uuid', nullable: true })
  managerId: string | null;

  // Import that caused the event; NULL for manager decisions.
  @Column({ name: 'import_id', type: 'uuid', nullable: true })
  importId: string | null;

  @Column({ name: 'payload', type: 'jsonb' })
  payload: MatchEventPayload;
}
