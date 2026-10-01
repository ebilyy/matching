import { CreateShops20261001120000 } from './20261001120000-CreateShops';
import { CreateManagers20261001120001 } from './20261001120001-CreateManagers';
import { CreateOwnProducts20261001120002 } from './20261001120002-CreateOwnProducts';
import { CreateSuppliers20261001120003 } from './20261001120003-CreateSuppliers';
import { CreateImports20261001120004 } from './20261001120004-CreateImports';
import { CreateSupplierPositions20261001120005 } from './20261001120005-CreateSupplierPositions';
import { CreateMatchEvents20261001120006 } from './20261001120006-CreateMatchEvents';
import { CreateMatches20261001120007 } from './20261001120007-CreateMatches';
import { CreateMatchProposals20261001120008 } from './20261001120008-CreateMatchProposals';
import { CreateRememberedDecisions20261001120009 } from './20261001120009-CreateRememberedDecisions';
import { AddContactsToSuppliers20261001120010 } from './20261001120010-AddContactsToSuppliers';

// Explicit list instead of a glob: works the same under ts-node, jest and dist.
// Append new pairs here in timestamp order.
export const MIGRATIONS = [
  CreateShops20261001120000,
  CreateManagers20261001120001,
  CreateOwnProducts20261001120002,
  CreateSuppliers20261001120003,
  CreateImports20261001120004,
  CreateSupplierPositions20261001120005,
  CreateMatchEvents20261001120006,
  CreateMatches20261001120007,
  CreateMatchProposals20261001120008,
  CreateRememberedDecisions20261001120009,
  AddContactsToSuppliers20261001120010,
];
