---
id: T14
title: "Add suppliers list / create / get with price staleness"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T05]
layer: "ports + app"
module: "suppliers"
epic: product-matching
updated_at: "2026-10-01"
---

# T14 — Add suppliers list / create / get with price staleness

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T05](./t05-tenant-scoped-data-access.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [openapi.yaml](../contracts/openapi.yaml) `listSuppliers`, `createSupplier`, `getSupplier`
- [AC-02](../PRD.md#5-acceptance-criteria), [AC-18](../PRD.md#5-acceptance-criteria)
- [data-model](../data-model.md) `suppliers`

## Scope

- CRUD minus update/delete; `feed_url` pattern `^https?://`; `is_price_stale = price_date < now() − 7 d`.
- `SuppliersService.getMapping/saveMapping` used by price-import.

## Out of scope

- `PATCH /suppliers/{id}` (F-2, needs PM).

## Definition of Ready

- [ ] T05 merged.

## Definition of Done

- [ ] Integration tests for the three operations validated against openapi; staleness boundary at exactly 7 days.
- [ ] Cross-shop test (AC-12) → 404 `supplier.not_found`.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
