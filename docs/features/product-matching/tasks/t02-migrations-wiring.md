---
id: T02
title: "Wire the 10 SQL migration pairs into TypeORM CLI"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T01]
layer: "migration"
module: "infrastructure/database"
epic: product-matching
updated_at: "2026-10-01"
---

# T02 — Wire the 10 SQL migration pairs into TypeORM CLI

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T01](./t01-project-skeleton.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [migrations/](../../../../migrations/) `20261001120000…09` — the reviewed source of truth
- [rules/migrations.md](../../../../.claude/rules/migrations.md) → Project overrides (thin class per pair)
- [data-model](../data-model.md)

## Scope

- TypeORM `DataSource` config (`transaction: 'each'`), `migration:run` / `migration:revert` npm scripts.
- One class per pair in `src/infrastructure/database/migrations/<YYYYMMDDhhmmss>-<Name>.ts` that runs `readFileSync` of the `.up.sql` / `.down.sql`.
- One-shot `migrate` compose service that runs before `api` / `worker`.
- CI job: up ×10 → up again (idempotent) → down ×10 → up (the roundtrip from the data-model report).

## Out of scope

- Changing any SQL file. Schema changes go through new pairs per [rules/migrations.md](../../../../.claude/rules/migrations.md).

## Definition of Ready

- [ ] T01 merged.

## Definition of Done

- [ ] CI roundtrip job green: 10 tables and 33 indexes after up, 0 after down.
- [ ] `migration:generate` run against an empty diff is not used; the PR does not add generated migrations.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
