import { Column, Entity, ForeignKey, Index, PrimaryColumn } from 'typeorm';
import { OwnProductEntity } from '../../catalog/entities/own-product.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';
import { SupplierPositionEntity } from '../../suppliers/entities/supplier-position.entity';
import { MatchOrigin } from '../match-ledger.enums';

// Inline projection of match_events: current matches (ADR-0004; SAD match_view).
// The only source of purchase price and availability (AC-16). Keyed by the stream,
// with the event-derived matched_at instead of created_at (rebuild rewrites rows).
// Schema: migrations/20261001120007_create_matches.
@Entity({ name: 'matches' })
@ForeignKey(
  () => OwnProductEntity,
  ['shopId', 'ownProductId'],
  ['shopId', 'id'],
  { name: 'fk_matches_own_product' },
)
@ForeignKey(
  () => SupplierPositionEntity,
  ['shopId', 'supplierPositionId'],
  ['shopId', 'id'],
  { name: 'fk_matches_supplier_position' },
)
@Index('idx_matches_shop_id_supplier_position_id', [
  'shopId',
  'supplierPositionId',
])
export class MatchEntity {
  @PrimaryColumn({
    name: 'shop_id',
    type: 'uuid',
    primaryKeyConstraintName: 'pk_matches',
  })
  @ForeignKey(() => ShopEntity, { name: 'matches_shop_id_fkey' })
  shopId: string;

  @PrimaryColumn({
    name: 'own_product_id',
    type: 'uuid',
    primaryKeyConstraintName: 'pk_matches',
  })
  ownProductId: string;

  @PrimaryColumn({
    name: 'supplier_position_id',
    type: 'uuid',
    primaryKeyConstraintName: 'pk_matches',
  })
  supplierPositionId: string;

  @Column({ name: 'origin', type: 'varchar', length: 32 })
  origin: MatchOrigin;

  @Column({ name: 'stream_version', type: 'integer' })
  streamVersion: number;

  @Column({ name: 'matched_at', type: 'timestamptz' })
  matchedAt: Date;
}
