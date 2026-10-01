---
id: T06
title: "Set up pg-boss queues with enqueue-in-transaction and versioned payloads"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T03]
layer: "infra"
module: "infrastructure/jobs"
epic: product-matching
updated_at: "2026-10-01"
---

# T06 — Set up pg-boss queues with enqueue-in-transaction and versioned payloads

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T03](./t03-common-context-errors.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [ADR-0003](../adr/0003-run-imports-in-worker-process-with-postgres-job-queue.md)
- [events.md](../contracts/events.md) → queues `catalog.import`, `price.import`, `feed.fetch` (payload v1, idempotency)
- [SAD §7](../sad.md#7-deployment-view) — retention 7 days

## Scope

- pg-boss bootstrap (own `pgboss` schema), queue definitions, retention 7 days.
- `enqueueInTx(manager, queue, payload)` that uses the caller's transaction connection.
- Payload types v1 + runtime validator at the consumer (pick class-validator or zod; close the events.md TBD).
- Worker-side handler base that restores RequestContext from the payload before running.
- Default retry policy for import jobs (close the events.md TBD, F-5): proposed retryLimit 2, then `rejected` / `unreadable_file`.

## Out of scope

- Concrete handlers (T12, T19, T29).

## Definition of Ready

- [ ] T03 merged.

## Definition of Done

- [ ] Integration test: a rolled-back transaction leaves no job; a committed one leaves exactly one.
- [ ] Integration test: handler sees the `shop_id` from the payload in RequestContext.
- [ ] events.md TBDs for validator and retry policy replaced with the decision.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
