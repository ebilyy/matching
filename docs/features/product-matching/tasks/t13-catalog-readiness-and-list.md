---
id: T13
title: "Add catalog readiness and own-products list endpoints"
status: todo
priority: P0
estimate: M  # 3 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T05]
layer: "ports"
module: "catalog"
epic: product-matching
updated_at: "2026-10-01"
---

# T13 — Add catalog readiness and own-products list endpoints

**Estimate:** M (3 h) · **Priority:** P0 · **Deps:** [T05](./t05-tenant-scoped-data-access.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [AC-01](../PRD.md#5-acceptance-criteria)
- [openapi.yaml](../contracts/openapi.yaml) `getCatalogReadiness`, `listOwnProducts`
- [api-sync-report](../contracts/api-sync-report.md) → D-11 (archived excluded)

## Scope

- `GET /catalog/readiness` (total, without reliable code; archived excluded).
- `GET /own-products` with cursor pagination.

## Out of scope

- Search / filter on the list (sync report F-3, not in an AC).

## Definition of Ready

- [ ] T05 merged.

## Definition of Done

- [ ] Integration tests with responses validated against openapi; AC-01 numbers on a fixture set.
- [ ] Cross-shop test (AC-12).
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
