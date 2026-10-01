---
id: T05
title: "Enforce shop_id on every query (base repository + raw-SQL helper + isolation harness)"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
deps: [T03, T04]
layer: "infra/repo"
module: "common, infrastructure/database"
epic: product-matching
updated_at: "2026-10-01"
---

# T05 — Enforce shop_id on every query (base repository + raw-SQL helper + isolation harness)

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T03](./t03-common-context-errors.md), [T04](./t04-entities-fixtures.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [ADR-0008](../adr/0008-isolate-shops-by-shop-id-with-enforced-repository-filter.md) — decision and consequences
- [SAD §8](../sad.md#8-crosscutting-concepts) — Multi-tenancy row
- [AC-12](../PRD.md#5-acceptance-criteria)

## Scope

- `ShopScopedRepository<T>` that injects `shop_id` from RequestContext into every find / insert / update / delete and throws when the context is missing.
- `shopSql(strings, …)` helper for raw SQL (cascade, projections) that refuses a query without a `shop_id` parameter.
- ESLint rule or architecture test: no direct `dataSource.query` / `getRepository` outside these two.
- Isolation test harness: `asShop(A)` / `asShop(B)` helpers used by every endpoint and job test (AC-12).

## Out of scope

- Postgres RLS (accepted debt, SAD §11).

## Definition of Ready

- [ ] T03, T04 merged.

## Definition of Done

- [ ] Unit tests: missing context → error; helper without `shop_id` → error.
- [ ] Architecture test fails on a deliberate direct query in a sample file.
- [ ] Harness used in at least one passing cross-shop test.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
