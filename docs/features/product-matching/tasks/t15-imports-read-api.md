---
id: T15
title: "Add imports list and detail endpoints"
status: todo
priority: P0
estimate: M  # 3 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T05]
layer: "ports"
module: "file-intake"
epic: product-matching
updated_at: "2026-10-01"
---

# T15 — Add imports list and detail endpoints

**Estimate:** M (3 h) · **Priority:** P0 · **Deps:** [T05](./t05-tenant-scoped-data-access.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [openapi.yaml](../contracts/openapi.yaml) `listImports`, `getImport`
- [AC-02](../PRD.md#5-acceptance-criteria), [AC-03](../PRD.md#5-acceptance-criteria), [AC-04](../PRD.md#5-acceptance-criteria)
- [SAD §6](../sad.md#6-runtime-view) Critical flow 1 polling

## Scope

- List by `created_at DESC` with cursor; detail with `issues` and `uploaded_by` (`Actor`, system when `manager_id` null).

## Definition of Ready

- [ ] T05 merged.

## Definition of Done

- [ ] Integration tests validated against openapi.
- [ ] Cross-shop → 404 `import.not_found`.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
