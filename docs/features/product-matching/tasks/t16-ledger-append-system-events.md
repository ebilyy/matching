---
id: T16
title: "Build match-ledger append with inline projections for system events"
status: todo
priority: P0
estimate: L  # 8 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T05]
layer: "domain + infra"
module: "match-ledger"
epic: product-matching
updated_at: "2026-10-01"
---

# T16 — Build match-ledger append with inline projections for system events

**Estimate:** L (8 h) · **Priority:** P0 · **Deps:** [T05](./t05-tenant-scoped-data-access.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [ADR-0004](../adr/0004-event-source-matches-and-decisions-with-inline-projections.md)
- [ADR-0007](../adr/0007-split-monolith-into-eight-nest-modules-with-ledger-as-sole-event-writer.md) — ledger is the sole writer
- [events.md](../contracts/events.md) → Ledger events, Types table
- [data-model](../data-model.md) → Match ledger

## Scope

- `MatchLedger.append(events[])` in one transaction: insert `match_events` (stream_version = current + 1) and apply each event to `matches`, `match_proposals`, `remembered_decisions`.
- Event types `AutoMatched`, `ProposalCreated`, `ReturnedToQueue` with schema_version 1 and payload types; upcaster hook.
- Batch append for the cascade (multi-row insert, chunked) — the QG-2 hot path.
- Unique violation on `uq_match_events_stream_version` → `VersionConflict` domain error.
- Replace the `appendMatchEvent` fixture stub (T04).
- Architecture test: no module other than match-ledger writes to the four tables.

## Out of scope

- Manager decision events (T17).

## Definition of Ready

- [ ] T05 merged.

## Definition of Done

- [ ] Unit tests: projection reducer per event type.
- [ ] Integration test: 10 000-event batch append under 5 s locally (early QG-2 signal, ADR-0004 risk).
- [ ] Rebuild check: truncate projections → replay journal → identical rows.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- SAD §11 Medium risk: event volume vs QG-2. Report the batch timing in the PR description.
