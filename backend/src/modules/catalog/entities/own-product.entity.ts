import { Column, Entity, ForeignKey, Index, Unique } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';

// The shop's catalog (ADR-0002), upserted by (shop_id, sku) on catalog import.
// Schema: migrations/20261001120002_create_own_products. Constraint and index names
// mirror the SQL so the drift check (migration:check) matches them.
@Entity({ name: 'own_products' })
@Unique('uq_own_products_shop_id_id', ['shopId', 'id'])
@Unique('uq_own_products_shop_id_sku', ['shopId', 'sku'])
@Index('idx_own_products_shop_id_barcode', ['shopId', 'barcode'], {
  where: 'barcode IS NOT NULL',
})
@Index(
  'idx_own_products_shop_id_manufacturer_code',
  ['shopId', 'manufacturerCode'],
  { where: 'manufacturer_code IS NOT NULL' },
)
export class OwnProductEntity extends AbstractEntity {
  @Column({ name: 'shop_id', type: 'uuid' })
  @ForeignKey(() => ShopEntity, { name: 'own_products_shop_id_fkey' })
  shopId: string;

  @Column({ name: 'sku', type: 'varchar', length: 100 })
  sku: string;

  @Column({ name: 'name', type: 'varchar', length: 500 })
  name: string;

  // Normalized: digits only. Reliable code for cascade stage (a).
  @Column({ name: 'barcode', type: 'varchar', length: 32, nullable: true })
  barcode: string | null;

  // Normalized: upper case, no spaces or dashes. Reliable code for cascade stage (a).
  @Column({
    name: 'manufacturer_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  manufacturerCode: string | null;

  @Column({ name: 'brand', type: 'varchar', length: 200, nullable: true })
  brand: string | null;

  @Column({ name: 'category', type: 'varchar', length: 500, nullable: true })
  category: string | null;

  // Missing from a re-uploaded catalog; matches are kept (TBD-2). Domain state, not soft delete.
  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true })
  archivedAt: Date | null;
}
