---
id: T30
title: "Schedule daily feed fetches and route exhausted retries to the DLQ"
status: todo
priority: P1
estimate: S  # 3 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T29]
layer: "app"
module: "suppliers"
epic: product-matching
updated_at: "2026-10-01"
---

# T30 — Schedule daily feed fetches and route exhausted retries to the DLQ

**Estimate:** S (3 h) · **Priority:** P1 · **Deps:** [T29](./t29-feed-fetch-manual.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [SAD §3](../sad.md#3-context-and-scope) — feed refresh
- [events.md](../contracts/events.md) `feed.fetch` DLQ
- [SAD §7](../sad.md#7-deployment-view) — alert «фід не забрався 2 доби»
- [SAD §11](../sad.md#11-risks-and-technical-debt) — scope cut: schedule after first pilot week

## Scope

- pg-boss cron: one job per supplier with `feed_url`, key `<supplier_id>:<YYYY-MM-DD>`, `manager_id = null`.
- `feed.fetch.dlq`; log an alert-level event when a supplier failed 2 days in a row.

## Out of scope

- Choosing the monitoring tool (SAD §11 OQ).

## Definition of Ready

- [ ] T29 merged.

## Definition of Done

- [ ] Integration test: cron tick enqueues one job per feed supplier across two shops, each with its own shop context.
- [ ] Third failure lands in the DLQ; previous price stays in force.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- P1: SAD §11 lists the schedule as the first cut if the budget slips.
