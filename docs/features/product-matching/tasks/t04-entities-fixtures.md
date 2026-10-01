---
id: T04
title: "Map TypeORM entities for all 10 tables and add test fixture factories"
status: todo
priority: P0
estimate: L  # 8 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T02]
layer: "domain"
module: "per owner module (data-model → Aggregates)"
epic: product-matching
updated_at: "2026-10-01"
---

# T04 — Map TypeORM entities for all 10 tables and add test fixture factories

**Estimate:** L (8 h) · **Priority:** P0 · **Deps:** [T02](./t02-migrations-wiring.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [data-model](../data-model.md) → Entities, Aggregates (owner module per table)
- [data-model → Test fixtures](../data-model.md#test-fixtures)
- [ADR-0008](../adr/0008-isolate-shops-by-shop-id-with-enforced-repository-filter.md) — composite keys

## Scope

- Entities for `shops`, `managers`, `own_products`, `suppliers`, `supplier_positions`, `imports`, `match_events`, `matches`, `match_proposals`, `remembered_decisions`, each in its owner module.
- TS enums for `kind`, `source`, `status`, `origin`, `reason`, `decision`, `type` (no DB CHECK, per [rules/migrations.md](../../../../.claude/rules/migrations.md)).
- UUID v7 generator in `common/`.
- Factories in `src/testing/fixtures/` per the data-model contract (`appendMatchEvent` stubbed until T16).
- Drift check: `migration:generate --dryrun` shows no diff between entities and schema.

## Out of scope

- Repositories and queries (T05).

## Definition of Ready

- [ ] T02 merged.

## Definition of Done

- [ ] Drift check is empty and runs in CI.
- [ ] Integration test creates one row per table through the factories.
- [ ] Fixtures contain no real-looking PII (`Test User`, `@example.test`).
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- TBD-1 (`updated_at`) stays open: do not add the column here.
