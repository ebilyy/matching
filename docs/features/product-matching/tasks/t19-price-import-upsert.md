---
id: T19
title: "Process price.import: diff, batched upsert, absent_since, price date"
status: todo
priority: P0
estimate: L  # 8 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T06, T10, T14]
layer: "app/service"
module: "price-import"
epic: product-matching
updated_at: "2026-10-01"
---

# T19 — Process price.import: diff, batched upsert, absent_since, price date

**Estimate:** L (8 h) · **Priority:** P0 · **Deps:** [T06](./t06-job-queue-infra.md), [T10](./t10-staging-validation.md), [T14](./t14-suppliers-api.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [ADR-0005](../adr/0005-upsert-supplier-positions-in-place-after-staging-validation.md)
- [SAD §4](../sad.md#4-solution-strategy) strategy 3
- [SAD §6](../sad.md#6-runtime-view) Critical flow 1
- [AC-02](../PRD.md#5-acceptance-criteria), [AC-03](../PRD.md#5-acceptance-criteria), [AC-04](../PRD.md#5-acceptance-criteria), [AC-17](../PRD.md#5-acceptance-criteria)
- [events.md](../contracts/events.md) `price.import` v1

## Scope

- Handler: `queued` guard → `processing` → parse + validate (T09/T10) → on error `rejected` / `awaiting_mapping` with live rows untouched.
- Diff staging vs live by `position_key`: collect changed fingerprints (input to cascade b) and missing positions.
- Upsert in 5 000-row batches, short transactions; set / clear `absent_since`.
- Last batch sets `suppliers.price_date`; save mapping on first successful import (AC-02).
- Hook point `CascadeRunner.run(importId, changedSet)` (no-op until T20).
- `applied` with `rows_recognized`; `finished_at` for the QG-2 measure.

## Out of scope

- Cascade logic (T20–T23).

## Definition of Ready

- [ ] T06, T10, T14 merged.

## Definition of Done

- [ ] Integration tests: rejected import leaves live rows byte-identical (AC-03); second price with one row removed sets `absent_since` (AC-17); returning row clears it.
- [ ] Crash mid-way and re-run converges to the same rows (idempotency note in events.md).
- [ ] 50 000-row synthetic import completes locally; time noted in the PR.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
