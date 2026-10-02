import type { DataSource } from 'typeorm';
import { ENTITIES } from '../src/infrastructure/database/entities';
import { ImportKind } from '../src/modules/file-intake/import.enums';
import { MatchProposalEntity } from '../src/modules/match-ledger/entities/match-proposal.entity';
import { Decision } from '../src/modules/match-ledger/match-ledger.enums';
import {
  appendMatchEvent,
  createImport,
  createManager,
  createMatch,
  createMatchProposal,
  createOwnProduct,
  createRememberedDecision,
  createShop,
  createSupplier,
  createSupplierPosition,
} from './fixtures';
import { createTestDatabase, dropTestDatabase } from './support/test-database';

// T04: entities mirror the SQL schema exactly, and the fixtures can fill every table.
describe('entities ↔ schema', () => {
  let ds: DataSource;

  beforeAll(async () => {
    ds = await createTestDatabase('entities');
  });

  afterAll(async () => {
    await dropTestDatabase(ds);
  });

  // Same diff as `npm run migration:check`: any column, FK, unique or index that
  // differs from backend/migrations/ shows up as a statement here.
  it('has no drift between entities and the migrated schema', async () => {
    const diff = await ds.driver.createSchemaBuilder().log();

    expect(diff.upQueries.map((q) => q.query)).toEqual([]);
  });

  it('maps every table owned by the migrations', async () => {
    const tables = await ds.query<{ tablename: string }[]>(
      `SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tablename <> 'migrations'`,
    );

    expect(ENTITIES.map((e) => ds.getMetadata(e).tableName).sort()).toEqual(
      tables.map((t) => t.tablename).sort(),
    );
  });

  it('creates one row per table through the factories', async () => {
    const shop = await createShop(ds);
    const manager = await createManager(ds, shop);
    const ownProduct = await createOwnProduct(ds, shop, {
      brand: 'Test Brand',
    });
    const supplier = await createSupplier(ds, shop);
    const position = await createSupplierPosition(ds, supplier);
    const priceImport = await createImport(ds, shop, {
      kind: ImportKind.Price,
      supplierId: supplier.id,
      managerId: manager.id,
    });
    const pair = { ownProduct, position };
    await appendMatchEvent(ds, pair, { importId: priceImport.id });
    await createMatch(ds, pair);

    // A second position: one pair cannot sit in the queue and be matched at once.
    const queued = {
      ownProduct,
      position: await createSupplierPosition(ds, supplier),
    };
    await createMatchProposal(ds, queued);
    await createRememberedDecision(ds, queued, { decision: Decision.Rejected });

    for (const entity of ENTITIES) {
      await expect(ds.getRepository(entity).count()).resolves.toBeGreaterThan(
        0,
      );
    }
    const proposal = await ds
      .getRepository(MatchProposalEntity)
      .findOneByOrFail({ shopId: shop.id });
    expect(proposal).toMatchObject({
      brand: 'Test Brand',
      confidence: '0.800',
    });
  });

  it('keeps fixtures free of real-looking PII', async () => {
    const shop = await createShop(ds);
    const manager = await createManager(ds, shop);
    const supplier = await createSupplier(ds, shop);

    expect(shop.name).toBe('Test Shop');
    expect(manager.displayName).toBe('Test User');
    expect(supplier.email).toMatch(/@example\.test$/);
    expect(supplier.website).toMatch(/\.example\.test$/);
  });
});
