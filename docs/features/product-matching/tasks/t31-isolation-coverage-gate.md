---
id: T31
title: "Gate CI on AC-12 isolation coverage for every route and job"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Security Lead"]
deps: [T12, T13, T15, T17, T18, T26, T27, T28, T29]
layer: "tests"
module: "(tests)"
epic: product-matching
updated_at: "2026-10-01"
---

# T31 — Gate CI on AC-12 isolation coverage for every route and job

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T12](./t12-catalog-import.md), [T13](./t13-catalog-readiness-and-list.md), [T15](./t15-imports-read-api.md), [T17](./t17-ledger-decisions-history.md), [T18](./t18-price-upload-and-mapping.md), [T26](./t26-review-bulk-confirm.md), [T27](./t27-review-cancel-match.md), [T28](./t28-offers-and-coverage.md), [T29](./t29-feed-fetch-manual.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [ADR-0008](../adr/0008-isolate-shops-by-shop-id-with-enforced-repository-filter.md) — «інтеграційний тест AC-12 на кожен ендпоінт і задачу»
- [AC-12](../PRD.md#5-acceptance-criteria)
- [SAD §10](../sad.md#10-quality-requirements) QG-1 (d)

## Scope

- Meta-test that enumerates Nest routes and pg-boss queues and fails if any lacks a tagged cross-shop test.
- Fill any gaps it reveals.

## Definition of Ready

- [ ] All endpoint / job tasks listed in deps merged.

## Definition of Done

- [ ] Meta-test green and required in CI; adding an untested route makes it fail (proved in the PR).
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
