---
id: T12
title: "Ship catalog import: POST /catalog/imports + catalog.import job"
status: todo
priority: P0
estimate: L  # 6 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T08, T10]
layer: "ports + app"
module: "catalog"
epic: product-matching
updated_at: "2026-10-01"
---

# T12 — Ship catalog import: POST /catalog/imports + catalog.import job

**Estimate:** L (6 h) · **Priority:** P0 · **Deps:** [T08](./t08-file-intake-upload.md), [T10](./t10-staging-validation.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [ADR-0002](../adr/0002-upload-own-catalog-via-manager-ui-with-shared-import-pipeline.md)
- [SAD §6](../sad.md#6-runtime-view) US-01 flow
- [openapi.yaml](../contracts/openapi.yaml) `uploadCatalog`
- [events.md](../contracts/events.md) `catalog.import` v1
- [data-model → Open items](../data-model.md#open-items-tbd) TBD-2 (archive), TBD-4 (shop SKU)

## Scope

- Controller `uploadCatalog` → `FileIntakeService` (T08) → 202 `Import`.
- Job handler: status `queued` guard → staging → validation → upsert `own_products` by `(shop_id, sku)` in batches → set `archived_at` on products missing from the file → `applied` with counts.

## Out of scope

- Re-running the cascade after a catalog import (sequences audit gap 3, open).

## Definition of Ready

- [ ] T08, T10 merged.
- [ ] **TBD-4 confirmed** (shop SKU is a mandatory catalog column).
- [ ] TBD-2 default (archive, keep matches) accepted or changed by PM.

## Definition of Done

- [ ] Integration test: upload → poll → `applied`; re-upload with one product removed → `archived_at` set, its matches untouched.
- [ ] Redelivered job for an `applied` import is a no-op.
- [ ] Cross-shop test (AC-12): shop B cannot read shop A's import.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
