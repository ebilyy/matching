import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';

// Tenant root (ADR-0008): the only table without shop_id.
// Schema: migrations/20261001120000_create_shops.
@Entity({ name: 'shops' })
export class ShopEntity extends AbstractEntity {
  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;
}
