import { OwnProductEntity } from '../../modules/catalog/entities/own-product.entity';
import { ImportEntity } from '../../modules/file-intake/entities/import.entity';
import { ManagerEntity } from '../../modules/managers/entities/manager.entity';
import { MatchEventEntity } from '../../modules/match-ledger/entities/match-event.entity';
import { MatchProposalEntity } from '../../modules/match-ledger/entities/match-proposal.entity';
import { MatchEntity } from '../../modules/match-ledger/entities/match.entity';
import { RememberedDecisionEntity } from '../../modules/match-ledger/entities/remembered-decision.entity';
import { ShopEntity } from '../../modules/shops/entities/shop.entity';
import { SupplierPositionEntity } from '../../modules/suppliers/entities/supplier-position.entity';
import { SupplierEntity } from '../../modules/suppliers/entities/suppliers.entity';

// Every table owned by backend/migrations/, one entity each. The app registers
// entities per module (autoLoadEntities); this list feeds the migration CLI drift
// check and integration tests, which need the full set at once.
export const ENTITIES = [
  ShopEntity,
  ManagerEntity,
  OwnProductEntity,
  SupplierEntity,
  SupplierPositionEntity,
  ImportEntity,
  MatchEventEntity,
  MatchEntity,
  MatchProposalEntity,
  RememberedDecisionEntity,
];
