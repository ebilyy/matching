import { Column, Entity, ForeignKey, Unique } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';
import { SupplierEntity } from './suppliers.entity';

// Live position of a supplier, upserted in place by position_key (ADR-0005) and
// never deleted: a position missing from the latest price gets absent_since (AC-17).
// Schema: migrations/20261001120005_create_supplier_positions.
@Entity({ name: 'supplier_positions' })
@Unique('uq_supplier_positions_shop_id_id', ['shopId', 'id'])
@Unique('uq_supplier_positions_shop_id_supplier_id_position_key', [
  'shopId',
  'supplierId',
  'positionKey',
])
@ForeignKey(() => SupplierEntity, ['shopId', 'supplierId'], ['shopId', 'id'], {
  name: 'fk_supplier_positions_supplier',
})
export class SupplierPositionEntity extends AbstractEntity {
  @Column({ name: 'shop_id', type: 'uuid' })
  @ForeignKey(() => ShopEntity, { name: 'supplier_positions_shop_id_fkey' })
  shopId: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  // Supplier code, or SHA-256 of the normalized name when there is none (ADR-0005).
  @Column({ name: 'position_key', type: 'varchar', length: 128 })
  positionKey: string;

  @Column({
    name: 'supplier_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  supplierCode: string | null;

  @Column({ name: 'name', type: 'varchar', length: 500 })
  name: string;

  // SHA-256 hex of (supplier code + normalized name); compared with
  // remembered_decisions.fingerprint by cascade stage (b) (AC-10, AC-11).
  @Column({ name: 'fingerprint', type: 'varchar', length: 64 })
  fingerprint: string;

  @Column({ name: 'barcode', type: 'varchar', length: 32, nullable: true })
  barcode: string | null;

  @Column({
    name: 'manufacturer_code',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  manufacturerCode: string | null;

  @Column({ name: 'brand', type: 'varchar', length: 200, nullable: true })
  brand: string | null;

  // NUMERIC travels as a decimal string (pg returns it as one; openapi money format).
  @Column({ name: 'price', type: 'numeric', precision: 14, scale: 4 })
  price: string;

  @Column({ name: 'in_stock', type: 'boolean', nullable: true })
  inStock: boolean | null;

  @Column({ name: 'stock_quantity', type: 'integer', nullable: true })
  stockQuantity: number | null;

  @Column({ name: 'absent_since', type: 'timestamptz', nullable: true })
  absentSince: Date | null;
}
