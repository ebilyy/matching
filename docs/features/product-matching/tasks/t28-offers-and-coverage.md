---
id: T28
title: "Add own-product offers and coverage endpoints"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T14, T16]
layer: "ports"
module: "offers"
epic: product-matching
updated_at: "2026-10-01"
---

# T28 — Add own-product offers and coverage endpoints

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T14](./t14-suppliers-api.md), [T16](./t16-ledger-append-system-events.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [openapi.yaml](../contracts/openapi.yaml) `getOwnProductOffers`, `getCoverage`
- [AC-15](../PRD.md#5-acceptance-criteria), [AC-16](../PRD.md#5-acceptance-criteria), [AC-17](../PRD.md#5-acceptance-criteria), [AC-18](../PRD.md#5-acceptance-criteria)
- [SAD §6](../sad.md#6-runtime-view) US-08 flow

## Scope

- Offers only from `matches` ⨝ positions ⨝ suppliers; candidates separately with `confirmed: false`; `absent_in_latest_price`, `is_price_stale`.
- Coverage: total (non-archived), matched distinct, pending proposals, ratio.

## Definition of Ready

- [ ] T14, T16 merged.

## Definition of Done

- [ ] Integration tests per AC-15…AC-18 (AC-15 with the 4 000 / 3 688 / 312 fixture).
- [ ] Invariant test: a product with only a proposal has no offer price (AC-16).
- [ ] Cross-shop → 404.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
