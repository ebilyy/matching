---
id: T27
title: "Add match cancellation"
status: todo
priority: P0
estimate: M  # 3 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T17]
layer: "ports + app"
module: "review"
epic: product-matching
updated_at: "2026-10-01"
---

# T27 — Add match cancellation

**Estimate:** M (3 h) · **Priority:** P0 · **Deps:** [T17](./t17-ledger-decisions-history.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [openapi.yaml](../contracts/openapi.yaml) `cancelMatch`
- [AC-13](../PRD.md#5-acceptance-criteria)
- [SAD §6](../sad.md#6-runtime-view) US-06 flow
- [data-model → Open items](../data-model.md#open-items-tbd) TBD-6

## Scope

- `POST /matches/{op}/{sp}/cancel` with `stream_version` → `MatchCancelled`; 404 foreign / missing; 409 `match.version_conflict`.

## Definition of Ready

- [ ] T17 merged.
- [ ] TBD-6 (cancel semantics) confirmed by PM, or the default kept explicitly.

## Definition of Done

- [ ] Integration test: cancel → offer no longer uses the price; next import does not recreate the pair (with T20/T21 merged, else a follow-up check in T21).
- [ ] Cross-shop → 404.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
