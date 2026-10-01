---
id: T20
title: "Implement cascade stage (a): exact reliable-code matching"
status: todo
priority: P0
estimate: L  # 6 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T16, T19]
layer: "domain + app"
module: "matching"
epic: product-matching
updated_at: "2026-10-01"
---

# T20 — Implement cascade stage (a): exact reliable-code matching

**Estimate:** L (6 h) · **Priority:** P0 · **Deps:** [T16](./t16-ledger-append-system-events.md), [T19](./t19-price-import-upsert.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [SAD §4](../sad.md#4-solution-strategy) strategy 2 (a)
- [AC-05](../PRD.md#5-acceptance-criteria), [AC-07](../PRD.md#5-acceptance-criteria), [AC-13](../PRD.md#5-acceptance-criteria)
- [sequences audit](../_audit/sequences-2026-10-01.md) gap 1 (respect rejections)
- [data-model → Indexes](../data-model.md#indexes) barcode / manufacturer_code indexes

## Scope

- Set-based SQL via `shopSql`: join imported positions to own products on barcode, then manufacturer code; skip archived products.
- Exactly one product → `AutoMatched` with `matched_code {kind, value}`; several → `ProposalCreated` `ambiguous_code` for each candidate.
- Skip pairs with a remembered `rejected` decision and the same fingerprint (gap 1, AC-13).
- Skip pairs already matched; write events only on a state change.
- Update `imports.auto_matched_count`, `proposals_count`.

## Out of scope

- Stages (b), (c).

## Definition of Ready

- [ ] T16, T19 merged.

## Definition of Done

- [ ] Integration tests for AC-05, AC-07, and a cancelled pair not recreated on the next price (AC-13).
- [ ] Re-import of an unchanged price writes 0 events.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
