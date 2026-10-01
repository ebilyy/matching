---
id: T24
title: "Add the review-queue list with keyset pagination and filters"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T16]
layer: "ports"
module: "review"
epic: product-matching
updated_at: "2026-10-01"
---

# T24 — Add the review-queue list with keyset pagination and filters

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T16](./t16-ledger-append-system-events.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [openapi.yaml](../contracts/openapi.yaml) `listMatchProposals`
- [AC-08](../PRD.md#5-acceptance-criteria)
- [PRD §6](../PRD.md#6-non-functional-requirements) queue p95 ≤ 1 s
- [api-sync-report](../contracts/api-sync-report.md) → D-3 (keyset by confidence)
- [data-model → Indexes](../data-model.md#indexes) `idx_match_proposals_*`

## Scope

- Keyset `(confidence DESC, own_product_id, supplier_position_id)`, page 50; filters brand / category; `is_low_confidence` from the configured threshold.

## Definition of Ready

- [ ] T16 merged.

## Definition of Done

- [ ] Integration test: order, cursor next/prev, filters; `EXPLAIN` uses the intended index (asserted on 50 000 proposals).
- [ ] Cross-shop test (AC-12).
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- Threshold default lives in config until the T22 ADR sets it.
