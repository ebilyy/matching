import { Column, Entity, ForeignKey, Unique } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';

export interface ColumnMappingEntry {
  header: string;
  role: string | null;
}

// Shape of suppliers.column_mapping (openapi ColumnMapping): headers in file order.
export interface ColumnMapping {
  columns: ColumnMappingEntry[];
}

// Schema: migrations/20261001120003_create_suppliers + 20261001120010_add_contacts_to_suppliers.
@Entity({ name: 'suppliers' })
@Unique('uq_suppliers_shop_id_id', ['shopId', 'id'])
export class SupplierEntity extends AbstractEntity {
  @Column({ name: 'shop_id', type: 'uuid' })
  @ForeignKey(() => ShopEntity, { name: 'suppliers_shop_id_fkey' })
  shopId: string;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 254, nullable: true })
  email: string | null;

  @Column({ name: 'website', type: 'text', nullable: true })
  website: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 32, nullable: true })
  phone: string | null;

  @Column({ name: 'feed_url', type: 'text', nullable: true })
  feedUrl: string | null;

  @Column({ name: 'column_mapping', type: 'jsonb', nullable: true })
  columnMapping: ColumnMapping | null;

  @Column({ name: 'price_date', type: 'timestamptz', nullable: true })
  priceDate: Date | null;
}
