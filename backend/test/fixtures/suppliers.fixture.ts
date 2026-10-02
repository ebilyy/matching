import { createHash } from 'node:crypto';
import type { DataSource } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { newId } from '../../src/common/ids/new-id';
import type { ShopEntity } from '../../src/modules/shops/entities/shop.entity';
import { SupplierPositionEntity } from '../../src/modules/suppliers/entities/supplier-position.entity';
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

export async function createSupplier(
  ds: DataSource,
  shop: ShopEntity,
  opts: Partial<SupplierEntity> = {},
): Promise<SupplierEntity> {
  return ds
    .getRepository(SupplierEntity)
    .save(buildSupplier({ ...opts, shopId: shop.id }));
}

let positionSeq = 0;

// position_key = supplier_code = 'SUP-<n>' (data-model → Test fixtures).
export async function createSupplierPosition(
  ds: DataSource,
  supplier: SupplierEntity,
  opts: Partial<SupplierPositionEntity> = {},
): Promise<SupplierPositionEntity> {
  const n = ++positionSeq;
  const supplierCode = opts.supplierCode ?? `SUP-${n}`;
  const name = opts.name ?? `TEST PRODUCT ${n}`;
  const position = Object.assign(new SupplierPositionEntity(), {
    id: newId(),
    positionKey: supplierCode,
    supplierCode,
    name,
    fingerprint: testFingerprint(supplierCode, name),
    barcode: null,
    manufacturerCode: null,
    brand: null,
    price: '100.0000',
    inStock: true,
    stockQuantity: null,
    absentSince: null,
    ...opts,
    shopId: supplier.shopId,
    supplierId: supplier.id,
  });
  return ds.getRepository(SupplierPositionEntity).save(position);
}

// SHA-256 hex of (supplier code + name). Stand-in until price-import (T19) owns
// the real normalization; tests only need it stable and 64 chars long.
export function testFingerprint(supplierCode: string, name: string): string {
  return createHash('sha256')
    .update(`${supplierCode}\n${name.trim().toLowerCase()}`)
    .digest('hex');
}
