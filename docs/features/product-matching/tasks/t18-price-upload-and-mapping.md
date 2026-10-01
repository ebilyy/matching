---
id: T18
title: "Add price upload and confirm-mapping endpoints"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T08, T14]
layer: "ports"
module: "price-import"
epic: product-matching
updated_at: "2026-10-01"
---

# T18 — Add price upload and confirm-mapping endpoints

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T08](./t08-file-intake-upload.md), [T14](./t14-suppliers-api.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [openapi.yaml](../contracts/openapi.yaml) `uploadSupplierPrice`, `confirmImportMapping`
- [AC-02](../PRD.md#5-acceptance-criteria), [AC-04](../PRD.md#5-acceptance-criteria)
- [SAD §6](../sad.md#6-runtime-view) Critical flow 2 (re-parse same file)

## Scope

- `POST /suppliers/{id}/price-imports` → intake (T08), kind `price`.
- `POST /imports/{id}/confirm-mapping`: only from `awaiting_mapping` (else 409 `import.not_awaiting_mapping`); one tx: save supplier mapping + set import `queued` + enqueue `price.import`.

## Out of scope

- The job handler (T19).

## Definition of Ready

- [ ] T08, T14 merged.

## Definition of Done

- [ ] Integration tests: 202 on upload; 409 on wrong status; mapping saved and job enqueued atomically.
- [ ] Cross-shop tests for both endpoints.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
