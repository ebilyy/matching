---
status: Draft
owner: "Backend Lead"
reviewers: ["Tech Lead"]
updated_at: "2026-10-01"
feature_size: M
stage: "10"
ticket: "<TBD>"
---

# Events — product-matching

<!-- Stage 10 → .claude/skills/api-forge/SKILL.md. Companion of ./openapi.yaml; drift notes in ./api-sync-report.md -->

product-matching has no message broker (ADR-0007: modules call each other directly). It has two asynchronous contracts:

1. **Jobs** between `api` and `worker`: pg-boss queues in Postgres (ADR-0003). They are derived from the `API->>PG: … + задача pg-boss` and `W->>PG: бере задачу` messages in SAD §6. The payload is the contract, because `api` and `worker` deploy from the same image but restart independently, so a job enqueued by version N may be processed by version N+1.
2. **Ledger events**: rows of `match_events` (ADR-0004). They are not published. They are the contract between `matching` / `review` (writers through `match-ledger`) and the projections, history and future rebuilds.

Common rules:

- Every job payload carries `RequestContext` (`shop_id`, `manager_id`). The worker restores it before touching data, and every query is filtered by `shop_id` (ADR-0008, SAD §8). `manager_id: null` means the system.
- Jobs are enqueued **in the same transaction** as the `imports` row they refer to (ADR-0003). There is no state where an import is recorded and its job is lost.
- Payloads carry ids only, never file contents, prices or cell values (SAD §8, logging rule).
- Completed jobs are kept for 7 days (SAD §7).
- **Backwards-compat policy:** additive only. New optional fields are fine. Removing or renaming a field means a new `v`, and the worker accepts both versions until the queue is drained.

---

## Queue: `catalog.import`

**Producer:** `api` (`catalog`, `POST /api/v1/catalog/imports`).
**Consumer:** `worker` (`file-intake` → `catalog`).
**Delivery:** at-least-once. **Ordering:** none (one job per import).

### Job: `catalog.import` v1

```json
{
  "v": 1,
  "shop_id": "<uuid>",
  "manager_id": "<uuid | null>",
  "import_id": "<uuid>"
}
```

**Required fields:** all.
**Idempotency:** the worker processes an import only if its status is `queued`. A redelivered job for an import in `processing` / `applied` / `rejected` completes as a no-op.
**Effect:** staging → validation → upsert `own_products` by `(shop_id, sku)`, archive missing ones → `imports.status = applied | rejected` (SAD §6 US-01).
**Retry / DLQ:** <!-- TBD: retry policy for import jobs is not specified in SAD; pg-boss re-runs jobs left unfinished by a restart (SAD §7). Proposed: retryLimit 2, no DLQ, status → rejected with issues.rejection_reason = unreadable_file after the last attempt. -->

## Queue: `price.import`

**Producers:** `api` (`price-import`): `POST /api/v1/suppliers/{id}/price-imports` and `POST /api/v1/imports/{id}/confirm-mapping` (re-queues the same file, SAD §6 flow 2). Also `worker` (`feed.fetch` handler, after storing the fetched file).
**Consumer:** `worker` (`file-intake` → `price-import` → `matching` → `match-ledger`).
**Delivery:** at-least-once. **Ordering:** none.

### Job: `price.import` v1

```json
{
  "v": 1,
  "shop_id": "<uuid>",
  "manager_id": "<uuid | null>",
  "import_id": "<uuid>"
}
```

**Required fields:** all. `supplier_id` and the column mapping are read from the `imports` row, so they are not duplicated here.
**Idempotency:** same rule as `catalog.import` (status must be `queued`). The upsert is keyed by `(shop_id, supplier_id, position_key)` and events are written only on a change of pair state (ADR-0004, ADR-0005), so a partial re-run after a crash converges.
**Effect:** SAD §6 flow 1 (applied, with counts) or flow 2 (`rejected` / `awaiting_mapping` with `issues`). Live positions are untouched until validation passes.
**Retry / DLQ:** <!-- TBD: same as catalog.import. -->

## Queue: `feed.fetch`

**Producers:** pg-boss cron in `worker` (daily, one job per supplier with `feed_url`), and `api` (`suppliers`, `POST /api/v1/suppliers/{id}/feed-fetches`).
**Consumer:** `worker` (`file-intake`: SSRF-guarded GET).
**Delivery:** at-least-once. **Ordering:** none.

### Job: `feed.fetch` v1

```json
{
  "v": 1,
  "shop_id": "<uuid>",
  "manager_id": "<uuid | null>",
  "supplier_id": "<uuid>",
  "idempotency_key": "<supplier_id>:<YYYY-MM-DD> | <supplier_id>:<request Idempotency-Key>"
}
```

**Required fields:** all. `manager_id` is null for the cron run.
**Idempotency:** `idempotency_key` becomes `imports.idempotency_key` (`UNIQUE (shop_id, idempotency_key)`, `VARCHAR(200)`). If an import with this key exists, the job completes without action (SAD §6 US-02).
**Rate limit:** if the shop has used 30 uploads in the last hour, the job is rescheduled with `startAfter = +1 h`, not failed.
**Effect:** on 200: store the original in S3, then in one transaction insert `imports` (`source = feed`, `status = queued`) and enqueue `price.import`.
**Retry:** `retryLimit: 3`, exponential backoff (`retryBackoff: true`) for timeouts and 5xx.
**Non-retryable:** a private address, a redirect to one, or a body over 50 MB → `imports.status = rejected` with `issues.rejection_reason` = `feed_blocked_address` | `feed_size_limit`. No retry.
**DLQ:** `feed.fetch.dlq` after 3 failed attempts. The previous price stays in force. Alert when a supplier's feed was not fetched 2 days in a row (SAD §7).
**Guards (PRD §6.1, SAD §8):** http(s) only; DNS resolved and private / loopback / link-local / 169.254.169.254 blocked; re-checked on every redirect (≤ 3); timeout 30 s; ≤ 50 MB.

---

## Ledger events (`match_events`, not published)

**Writer:** `match-ledger` only (ADR-0007). It is called by `matching` (worker cascade) and `review` (api decisions).
**Readers:** inline projections `matches`, `match_proposals`, `remembered_decisions` (same transaction), plus `GET /api/v1/own-products/{id}/history`.
**Stream:** `(shop_id, own_product_id, supplier_position_id)`. **Ordering:** `stream_version`, strictly +1. A duplicate version fails on `uq_match_events_stream_version`, which gives the 409 in the API.

### Envelope (columns)

```json
{
  "id": "<uuid v7>",
  "shop_id": "<uuid>",
  "own_product_id": "<uuid>",
  "supplier_position_id": "<uuid>",
  "stream_version": 1,
  "type": "AutoMatched",
  "schema_version": 1,
  "manager_id": "<uuid | null>",
  "import_id": "<uuid | null>",
  "payload": { },
  "created_at": "<RFC 3339>"
}
```

### Types (schema_version 1)

| `type` | Written by | Projection effect | Payload (known fields) | API exposure |
|---|---|---|---|---|
| `AutoMatched` | cascade (a) / (b) | + `matches` (`origin` `auto_code` / `auto_remembered`) | `matched_code {kind, value}` (AC-05) **or** `remembered: true` (AC-10) | history `explanation` |
| `ProposalCreated` | cascade (a) ambiguous, (c) similar | + `match_proposals` | `reason`, `confidence`, `explanation {matched, mismatched, ambiguous_code?}` (AC-06–AC-08) | queue, history |
| `ProposalConfirmed` | `review` | − proposal, + `matches` (`confirmed`), `remembered_decisions = confirmed` with fingerprint | — (actor = `manager_id`) | history |
| `ProposalRejected` | `review` | − proposal, `remembered_decisions = rejected` with fingerprint | — | history |
| `MatchCancelled` | `review` | − `matches`, `remembered_decisions = rejected` with current fingerprint (TBD-6) | — | history |
| `ReturnedToQueue` | cascade (b), fingerprint changed | − `matches`, + `match_proposals` (`fingerprint_changed`) | `changed: [Feature]` (AC-11) | queue `explanation.changed`, history |

<!-- TBD: payload JSON Schemas per type live in the match-ledger module (data-model: "каталог подій — у модулі match-ledger"). The fields above are what the API projects; the module may store more. Upcasters convert older schema_version on read (SAD §8). -->

## Schema registry

- Registry: none (single repo). Job payload types live in `src/infrastructure/jobs/` and event payload types in `src/modules/match-ledger/`, as TypeScript types with a runtime validator at the consumer.
- Validator: <!-- TBD: class-validator (NestJS default) or zod — decided with the project skeleton. -->

## Replay / DLQ

- Jobs: pg-boss retries per queue (above); `feed.fetch.dlq` is the only DLQ. Replay is a manual re-enqueue of the DLQ job after the cause is fixed. The idempotency key makes it safe.
- Ledger: projections can be rebuilt from `match_events` (ADR-0004). This is an offline operation, not exposed in the API.
