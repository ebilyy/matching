import { v7 as uuidv7 } from 'uuid';
import { SupplierEntity } from '../../src/modules/suppliers/entities/suppliers.entity';

// Test fixtures live here, never in migrations/ (rules/migrations.md → Seeds).
// shopId must point at an existing shop when the entity is persisted.
export function buildSupplier(
  overrides: Partial<SupplierEntity> = {},
): SupplierEntity {
  const id = overrides.id ?? uuidv7();
  return Object.assign(new SupplierEntity(), {
    id,
    shopId: uuidv7(),
    name: 'Test Supplier',
    email: `supplier-${id}@example.test`,
    website: 'https://supplier.example.test',
    description: 'Test supplier for automated tests.',
    phone: '+380000000000',
    feedUrl: null,
    columnMapping: null,
    priceDate: null,
    ...overrides,
  });
}
