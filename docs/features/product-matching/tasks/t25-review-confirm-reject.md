---
id: T25
title: "Add confirm and reject with optimistic concurrency"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T17]
layer: "ports + app"
module: "review"
epic: product-matching
updated_at: "2026-10-01"
---

# T25 — Add confirm and reject with optimistic concurrency

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T17](./t17-ledger-decisions-history.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [openapi.yaml](../contracts/openapi.yaml) `confirmMatchProposal`, `rejectMatchProposal`
- [AC-08](../PRD.md#5-acceptance-criteria), [AC-10](../PRD.md#5-acceptance-criteria)
- [SAD §6](../sad.md#6-runtime-view) Critical flow 3
- [PRD §6](../PRD.md#6-non-functional-requirements) concurrent decisions, decide p95 ≤ 300 ms
- [api-sync-report](../contracts/api-sync-report.md) → D-4, D-9

## Scope

- Body carries `stream_version`; ledger append; `VersionConflict` → 409 `match_proposal.already_decided` with `details.decided_by`; never-proposed pair → 404 (D-9: check the stream, not only the queue).

## Definition of Ready

- [ ] T17 merged.

## Definition of Done

- [ ] Integration test: two parallel confirms/rejects → exactly one decision event, the other gets 409 (PRD §6).
- [ ] After confirm the offer shows the position price (AC-08) — asserted through the ledger projection until T28 lands.
- [ ] Cross-shop → 404.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
