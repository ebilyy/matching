---
id: T35
title: "Build the catalog screens: upload wizard and readiness"
status: todo
priority: P0
estimate: L  # 6 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T34]
layer: "frontend"
module: "web"
epic: product-matching
updated_at: "2026-10-01"
---

# T35 — Build the catalog screens: upload wizard and readiness

**Estimate:** L (6 h) · **Priority:** P0 · **Deps:** [T34](./t34-spa-skeleton.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [AC-01](../PRD.md#5-acceptance-criteria)
- [SAD §6](../sad.md#6-runtime-view) US-01 flow
- [openapi.yaml](../contracts/openapi.yaml) `uploadCatalog`, `getCatalogReadiness`, `getImport`

## Scope

- Reusable «файл → розмітка колонок» wizard (also used by T36).
- Catalog import status polling and issues view; readiness counters.

## Definition of Ready

- [ ] T34 merged.

## Definition of Done

- [ ] Component tests for the wizard; e2e (Playwright) against Prism green.
- [ ] Manual check against the real API once T12/T13 are merged, noted in the PR.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
