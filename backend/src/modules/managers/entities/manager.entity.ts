import { Column, Entity, ForeignKey, Unique } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { ShopEntity } from '../../shops/entities/shop.entity';

// Actor named in match history (AC-14). How a request resolves to a manager is SAD §11 OQ.
// Schema: migrations/20261001120001_create_managers.
@Entity({ name: 'managers' })
@Unique('uq_managers_shop_id_id', ['shopId', 'id'])
export class ManagerEntity extends AbstractEntity {
  @Column({ name: 'shop_id', type: 'uuid' })
  @ForeignKey(() => ShopEntity, { name: 'managers_shop_id_fkey' })
  shopId: string;

  @Column({ name: 'display_name', type: 'varchar', length: 200 })
  displayName: string;
}
