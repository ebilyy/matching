---
id: T17
title: "Add decision events and the own-product history read"
status: todo
priority: P0
estimate: L  # 6 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T16]
layer: "domain + ports"
module: "match-ledger"
epic: product-matching
updated_at: "2026-10-01"
---

# T17 — Add decision events and the own-product history read

**Estimate:** L (6 h) · **Priority:** P0 · **Deps:** [T16](./t16-ledger-append-system-events.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [events.md](../contracts/events.md) → `ProposalConfirmed`, `ProposalRejected`, `MatchCancelled`
- [AC-13](../PRD.md#5-acceptance-criteria), [AC-14](../PRD.md#5-acceptance-criteria)
- [openapi.yaml](../contracts/openapi.yaml) `getOwnProductHistory`
- [api-sync-report](../contracts/api-sync-report.md) → D-5 (history not paginated)
- [data-model → Open items](../data-model.md#open-items-tbd) TBD-6

## Scope

- Event types and projection effects for the three decision events (remembered decision with the current fingerprint).
- `GET /own-products/{id}/history`: events for all streams of the product, actor (`system` or manager `display_name`), explanation.

## Out of scope

- HTTP decision endpoints (T25–T27).

## Definition of Ready

- [ ] T16 merged.
- [ ] TBD-6 default (cancel = remembered rejection) accepted for now.

## Definition of Done

- [ ] Unit tests per new reducer.
- [ ] Integration test: AutoMatched → MatchCancelled history shows system creator and manager canceller (AC-14).
- [ ] Cross-shop → 404 `own_product.not_found`.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
