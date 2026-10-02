import type { DataSource } from 'typeorm';
import { newId } from '../../src/common/ids/new-id';
import type { OwnProductEntity } from '../../src/modules/catalog/entities/own-product.entity';
import { MatchEventEntity } from '../../src/modules/match-ledger/entities/match-event.entity';
import { MatchProposalEntity } from '../../src/modules/match-ledger/entities/match-proposal.entity';
import { MatchEntity } from '../../src/modules/match-ledger/entities/match.entity';
import { RememberedDecisionEntity } from '../../src/modules/match-ledger/entities/remembered-decision.entity';
import {
  Decision,
  MatchEventType,
  MatchOrigin,
  ProposalReason,
} from '../../src/modules/match-ledger/match-ledger.enums';
import type { SupplierPositionEntity } from '../../src/modules/suppliers/entities/supplier-position.entity';

// The stream a ledger row belongs to: one own product × one supplier position.
export interface StreamPair {
  ownProduct: OwnProductEntity;
  position: SupplierPositionEntity;
}

function streamKey({ ownProduct, position }: StreamPair) {
  return {
    shopId: ownProduct.shopId,
    ownProductId: ownProduct.id,
    supplierPositionId: position.id,
  };
}

// TODO(T16): go through the match-ledger append service so the projections stay
// consistent with the journal. Until then this inserts the event row only.
export async function appendMatchEvent(
  ds: DataSource,
  pair: StreamPair,
  opts: Partial<MatchEventEntity> = {},
): Promise<MatchEventEntity> {
  const event = Object.assign(new MatchEventEntity(), {
    id: newId(),
    streamVersion: 1,
    type: MatchEventType.AutoMatched,
    schemaVersion: 1,
    managerId: null,
    importId: null,
    payload: {},
    ...opts,
    ...streamKey(pair),
  });
  return ds.getRepository(MatchEventEntity).save(event);
}

// Projection factories write rows directly, without a journal event. Use them for
// read-path tests only; anything that decides on a pair must go through the ledger.

export async function createMatch(
  ds: DataSource,
  pair: StreamPair,
  opts: Partial<MatchEntity> = {},
): Promise<MatchEntity> {
  const row = Object.assign(new MatchEntity(), {
    origin: MatchOrigin.AutoCode,
    streamVersion: 1,
    matchedAt: new Date(),
    ...opts,
    ...streamKey(pair),
  });
  return ds.getRepository(MatchEntity).save(row);
}

// brand / category default to the own product's, as the ledger copies them.
export async function createMatchProposal(
  ds: DataSource,
  pair: StreamPair,
  opts: Partial<MatchProposalEntity> = {},
): Promise<MatchProposalEntity> {
  const row = Object.assign(new MatchProposalEntity(), {
    reason: ProposalReason.Similar,
    confidence: '0.800',
    explanation: {},
    brand: pair.ownProduct.brand,
    category: pair.ownProduct.category,
    streamVersion: 1,
    proposedAt: new Date(),
    ...opts,
    ...streamKey(pair),
  });
  return ds.getRepository(MatchProposalEntity).save(row);
}

// fingerprint defaults to the position's current one, so cascade (b) would reapply it.
export async function createRememberedDecision(
  ds: DataSource,
  pair: StreamPair,
  opts: Partial<RememberedDecisionEntity> = {},
): Promise<RememberedDecisionEntity> {
  const row = Object.assign(new RememberedDecisionEntity(), {
    decision: Decision.Confirmed,
    fingerprint: pair.position.fingerprint,
    streamVersion: 1,
    decidedAt: new Date(),
    ...opts,
    ...streamKey(pair),
  });
  return ds.getRepository(RememberedDecisionEntity).save(row);
}
