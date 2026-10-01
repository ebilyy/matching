---
id: T23
title: "Implement cascade stage (c): similarity proposals"
status: todo
priority: P0
estimate: L  # 8 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T21, T22]
layer: "domain + app (+ migration)"
module: "matching"
epic: product-matching
updated_at: "2026-10-01"
---

# T23 — Implement cascade stage (c): similarity proposals

**Estimate:** L (8 h) · **Priority:** P0 · **Deps:** [T21](./t21-cascade-b-remembered.md), [T22](./t22-spike-similarity-mechanism.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- Spike ADR from T22
- [SAD §4](../sad.md#4-solution-strategy) strategy 2 (c)
- [AC-06](../PRD.md#5-acceptance-criteria), [AC-08](../PRD.md#5-acceptance-criteria)
- [rules/migrations.md](../../../../.claude/rules/migrations.md) → CONCURRENTLY rule (`transaction = false`)

## Scope

- Candidate search per the spike ADR for positions not resolved by (a) / (b); `ProposalCreated` `similar` with `confidence` and `explanation {matched, mismatched}`.
- Invariant: similarity never creates a match (AC-06).
- If pg_trgm is chosen: new migration pair with `CREATE EXTENSION` and a separate `CREATE INDEX CONCURRENTLY` file (`transaction = false`).

## Definition of Ready

- [ ] T21 merged, spike ADR (T22) Accepted.

## Definition of Done

- [ ] Integration test for AC-06 (similar names → proposal, never a match).
- [ ] Accuracy check on the spike dataset meets the ADR numbers.
- [ ] Migration roundtrip in CI still green.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
