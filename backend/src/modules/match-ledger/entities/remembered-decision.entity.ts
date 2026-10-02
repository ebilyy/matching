import { Column, Entity, ForeignKey, Index, PrimaryColumn } from 'typeorm';
import { OwnProductEntity } from '../../catalog/entities/own-product.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';
import { SupplierPositionEntity } from '../../suppliers/entities/supplier-position.entity';
import { Decision } from '../match-ledger.enums';

// Inline projection of match_events: manager decisions with the position fingerprint
// they were made on (ADR-0004; SAD remembered_decision_view). Cascade (b) reapplies a
// decision only while the fingerprint is unchanged (AC-10, AC-11).
// Schema: migrations/20261001120009_create_remembered_decisions.
@Entity({ name: 'remembered_decisions' })
@ForeignKey(
  () => OwnProductEntity,
  ['shopId', 'ownProductId'],
  ['shopId', 'id'],
  { name: 'fk_remembered_decisions_own_product' },
)
@ForeignKey(
  () => SupplierPositionEntity,
  ['shopId', 'supplierPositionId'],
  ['shopId', 'id'],
  { name: 'fk_remembered_decisions_supplier_position' },
)
@Index('idx_remembered_decisions_shop_id_supplier_position_id', [
  'shopId',
  'supplierPositionId',
])
export class RememberedDecisionEntity {
  @PrimaryColumn({
    name: 'shop_id',
    type: 'uuid',
    primaryKeyConstraintName: 'pk_remembered_decisions',
  })
  @ForeignKey(() => ShopEntity, { name: 'remembered_decisions_shop_id_fkey' })
  shopId: string;

  @PrimaryColumn({
    name: 'own_product_id',
    type: 'uuid',
    primaryKeyConstraintName: 'pk_remembered_decisions',
  })
  ownProductId: string;

  @PrimaryColumn({
    name: 'supplier_position_id',
    type: 'uuid',
    primaryKeyConstraintName: 'pk_remembered_decisions',
  })
  supplierPositionId: string;

  @Column({ name: 'decision', type: 'varchar', length: 16 })
  decision: Decision;

  @Column({ name: 'fingerprint', type: 'varchar', length: 64 })
  fingerprint: string;

  @Column({ name: 'stream_version', type: 'integer' })
  streamVersion: number;

  @Column({ name: 'decided_at', type: 'timestamptz' })
  decidedAt: Date;
}
