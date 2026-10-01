import { v7 as uuidv7 } from 'uuid';
import { ManagerEntity } from '../../src/modules/managers/entities/manager.entity';

// shopId must point at an existing shop when the entity is persisted.
export function buildManager(
  overrides: Partial<ManagerEntity> = {},
): ManagerEntity {
  return Object.assign(new ManagerEntity(), {
    id: uuidv7(),
    shopId: uuidv7(),
    displayName: 'Test User',
    ...overrides,
  });
}
