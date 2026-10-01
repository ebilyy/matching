import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';

// Actor named in match history (AC-14). How a request resolves to a manager is SAD §11 OQ.
// Schema: migrations/20261001120001_create_managers.
@Entity({ name: 'managers' })
export class ManagerEntity extends AbstractEntity {
  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  @Column({ name: 'display_name', type: 'varchar', length: 200 })
  displayName: string;
}
