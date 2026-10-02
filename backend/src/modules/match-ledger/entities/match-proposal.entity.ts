import { Column, Entity, ForeignKey, Index, PrimaryColumn } from 'typeorm';
import { OwnProductEntity } from '../../catalog/entities/own-product.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';
import { SupplierPositionEntity } from '../../suppliers/entities/supplier-position.entity';
import { ProposalReason } from '../match-ledger.enums';

// Which features matched or not, what changed. Shape depends on reason and on the
// stage (c) mechanism (SAD §11 OQ, T22).
export type ProposalExplanation = Record<string, unknown>;

// Inline projection of match_events: the review queue (ADR-0004; SAD proposal_queue_view).
// brand / category are copied from own_products so queue reads stay single-table (QG-3).
// Schema: migrations/20261001120008_create_match_proposals. DESC ordering of the
// indexes lives in the SQL only.
@Entity({ name: 'match_proposals' })
@ForeignKey(
  () => OwnProductEntity,
  ['shopId', 'ownProductId'],
  ['shopId', 'id'],
  { name: 'fk_match_proposals_own_product' },
)
@ForeignKey(
  () => SupplierPositionEntity,
  ['shopId', 'supplierPositionId'],
  ['shopId', 'id'],
  { name: 'fk_match_proposals_supplier_position' },
)
@Index('idx_match_proposals_shop_id_confidence', [
  'shopId',
  'confidence',
  'ownProductId',
  'supplierPositionId',
])
@Index('idx_match_proposals_shop_id_brand_confidence', [
  'shopId',
  'brand',
  'confidence',
])
@Index('idx_match_proposals_shop_id_category_confidence', [
  'shopId',
  'category',
  'confidence',
])
@Index('idx_match_proposals_shop_id_supplier_position_id', [
  'shopId',
  'supplierPositionId',
])
export class MatchProposalEntity {
  @PrimaryColumn({
    name: 'shop_id',
    type: 'uuid',
    primaryKeyConstraintName: 'pk_match_proposals',
  })
  @ForeignKey(() => ShopEntity, { name: 'match_proposals_shop_id_fkey' })
  shopId: string;

  @PrimaryColumn({
    name: 'own_product_id',
    type: 'uuid',
    primaryKeyConstraintName: 'pk_match_proposals',
  })
  ownProductId: string;

  @PrimaryColumn({
    name: 'supplier_position_id',
    type: 'uuid',
    primaryKeyConstraintName: 'pk_match_proposals',
  })
  supplierPositionId: string;

  @Column({ name: 'reason', type: 'varchar', length: 32 })
  reason: ProposalReason;

  // 0.000–1.000 as a decimal string; queue order (AC-08).
  @Column({ name: 'confidence', type: 'numeric', precision: 4, scale: 3 })
  confidence: string;

  @Column({ name: 'explanation', type: 'jsonb' })
  explanation: ProposalExplanation;

  @Column({ name: 'brand', type: 'varchar', length: 200, nullable: true })
  brand: string | null;

  @Column({ name: 'category', type: 'varchar', length: 500, nullable: true })
  category: string | null;

  @Column({ name: 'stream_version', type: 'integer' })
  streamVersion: number;

  @Column({ name: 'proposed_at', type: 'timestamptz' })
  proposedAt: Date;
}
