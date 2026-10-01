---
id: T10
title: "Validate and normalise staging rows; detect column-schema drift"
status: todo
priority: P0
estimate: L  # 6 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T09]
layer: "domain"
module: "file-intake"
epic: product-matching
updated_at: "2026-10-01"
---

# T10 — Validate and normalise staging rows; detect column-schema drift

**Estimate:** L (6 h) · **Priority:** P0 · **Deps:** [T09](./t09-streaming-parse-staging.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [AC-03](../PRD.md#5-acceptance-criteria), [AC-04](../PRD.md#5-acceptance-criteria)
- [SAD §6](../sad.md#6-runtime-view) Critical flow 2
- [data-model](../data-model.md) → normalisation notes on `barcode`, `manufacturer_code`, `fingerprint`, `position_key`
- [api-sync-report](../contracts/api-sync-report.md) → D-13 (truncate to 100)

## Scope

- Required roles per kind (price: name + price; catalog: sku + name).
- Price parsing to decimal (comma / dot, spaces); a non-number → `invalid_cells` entry.
- Code normalisation: barcode digits only; manufacturer code upper, no spaces / hyphens.
- `position_key` (supplier code or SHA-256 of normalised name) and `fingerprint` (SHA-256 of supplier code + normalised name).
- Schema diff of headers vs `suppliers.column_mapping` → `awaiting_mapping` with `column_diff`.
- Build `ImportIssues` JSON (first 100 cells + total).

## Out of scope

- Currency / VAT detection (PRD §8, not in scope).

## Definition of Ready

- [ ] T09 merged.
- [ ] TBD-5 (price / availability format) has a working default; revisit after real files.

## Definition of Done

- [ ] Unit tests for each normaliser and for the diff (added, removed, reordered columns).
- [ ] Integration test: a file with 3 bad prices → `rejected` with exactly those cells; issues JSON validates against openapi `ImportIssues`.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
