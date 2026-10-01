---
status: Draft
owner: "gene.bilyy@gmail.com"
updated_at: "2026-10-01"
stage: "13"
---

# Tracker — product-matching

Status values: `todo` · `blocked` · `in-progress` · `in-review` · `done`. Update the row in the same PR as the task.

| ID | Task | Layer | Est | Pri | Deps | Owner | Status | PR |
|----|------|-------|-----|-----|------|-------|--------|----|
| T01 | [Scaffold the NestJS app with api/worker roles and local compose](./t01-project-skeleton.md) | foundation | L (8h) | P0 | — | gene.bilyy@gmail.com | in_progress | — |
| T02 | [Wire the 10 SQL migration pairs into TypeORM CLI](./t02-migrations-wiring.md) | migration | M (4h) | P0 | T01 | gene.bilyy@gmail.com | in-progress | — |
| T03 | [Add RequestContext, problem+json errors, 422 validation and cursor codec](./t03-common-context-errors.md) | crosscutting | M (4h) | P0 | T01 | gene.bilyy@gmail.com | todo | — |
| T04 | [Map TypeORM entities for all 10 tables and add test fixture factories](./t04-entities-fixtures.md) | domain | L (8h) | P0 | T02 | gene.bilyy@gmail.com | todo | — |
| T05 | [Enforce shop_id on every query (base repository + raw-SQL helper + isolation harness)](./t05-tenant-scoped-data-access.md) | infra/repo | M (4h) | P0 | T03, T04 | gene.bilyy@gmail.com | todo | — |
| T06 | [Set up pg-boss queues with enqueue-in-transaction and versioned payloads](./t06-job-queue-infra.md) | infra | M (4h) | P0 | T03 | gene.bilyy@gmail.com | todo | — |
| T07 | [Add an S3 storage adapter for uploaded originals](./t07-object-storage-adapter.md) | infra | M (3h) | P0 | T01 | gene.bilyy@gmail.com | todo | — |
| T08 | [Build the shared upload intake: limits, 30/h rate limit, import row + job in one tx](./t08-file-intake-upload.md) | app/service | M (4h) | P0 | T05, T06, T07 | gene.bilyy@gmail.com | todo | — |
| T09 | [Stream-parse XLSX/CSV into a session TEMP staging table](./t09-streaming-parse-staging.md) | app/service | L (8h) | P0 | T02, T07 | gene.bilyy@gmail.com | todo | — |
| T10 | [Validate and normalise staging rows; detect column-schema drift](./t10-staging-validation.md) | domain | L (6h) | P0 | T09 | gene.bilyy@gmail.com | todo | — |
| T11 | [Implement the SSRF-guarded HTTP fetcher for supplier feeds](./t11-ssrf-guarded-fetcher.md) | infra | M (4h) | P0 | T01 | gene.bilyy@gmail.com | todo | — |
| T12 | [Ship catalog import: POST /catalog/imports + catalog.import job](./t12-catalog-import.md) | ports + app | L (6h) | P0 | T08, T10 | gene.bilyy@gmail.com | todo | — |
| T13 | [Add catalog readiness and own-products list endpoints](./t13-catalog-readiness-and-list.md) | ports | M (3h) | P0 | T05 | gene.bilyy@gmail.com | todo | — |
| T14 | [Add suppliers list / create / get with price staleness](./t14-suppliers-api.md) | ports + app | M (4h) | P0 | T05 | gene.bilyy@gmail.com | todo | — |
| T15 | [Add imports list and detail endpoints](./t15-imports-read-api.md) | ports | M (3h) | P0 | T05 | gene.bilyy@gmail.com | todo | — |
| T16 | [Build match-ledger append with inline projections for system events](./t16-ledger-append-system-events.md) | domain + infra | L (8h) | P0 | T05 | gene.bilyy@gmail.com | todo | — |
| T17 | [Add decision events and the own-product history read](./t17-ledger-decisions-history.md) | domain + ports | L (6h) | P0 | T16 | gene.bilyy@gmail.com | todo | — |
| T18 | [Add price upload and confirm-mapping endpoints](./t18-price-upload-and-mapping.md) | ports | M (4h) | P0 | T08, T14 | gene.bilyy@gmail.com | todo | — |
| T19 | [Process price.import: diff, batched upsert, absent_since, price date](./t19-price-import-upsert.md) | app/service | L (8h) | P0 | T06, T10, T14 | gene.bilyy@gmail.com | todo | — |
| T20 | [Implement cascade stage (a): exact reliable-code matching](./t20-cascade-a-exact-code.md) | domain + app | L (6h) | P0 | T16, T19 | gene.bilyy@gmail.com | todo | — |
| T21 | [Implement cascade stage (b): remembered decisions and fingerprint change](./t21-cascade-b-remembered.md) | domain + app | M (4h) | P0 | T20 | gene.bilyy@gmail.com | todo | — |
| T22 | [Spike: choose the similarity mechanism for cascade stage (c)](./t22-spike-similarity-mechanism.md) | spike | L (8h) | P0 | — | gene.bilyy@gmail.com | blocked | — |
| T23 | [Implement cascade stage (c): similarity proposals](./t23-cascade-c-similarity.md) | domain + app (+ migration) | L (8h) | P0 | T21, T22 | gene.bilyy@gmail.com | todo | — |
| T24 | [Add the review-queue list with keyset pagination and filters](./t24-review-queue-list.md) | ports | M (4h) | P0 | T16 | gene.bilyy@gmail.com | todo | — |
| T25 | [Add confirm and reject with optimistic concurrency](./t25-review-confirm-reject.md) | ports + app | M (4h) | P0 | T17 | gene.bilyy@gmail.com | todo | — |
| T26 | [Add bulk-confirm preview and bulk confirm (≤ 1 000)](./t26-review-bulk-confirm.md) | ports + app | M (4h) | P0 | T24, T25 | gene.bilyy@gmail.com | todo | — |
| T27 | [Add match cancellation](./t27-review-cancel-match.md) | ports + app | M (3h) | P0 | T17 | gene.bilyy@gmail.com | todo | — |
| T28 | [Add own-product offers and coverage endpoints](./t28-offers-and-coverage.md) | ports | M (4h) | P0 | T14, T16 | gene.bilyy@gmail.com | todo | — |
| T29 | [Add manual feed fetch: endpoint + feed.fetch job with idempotency](./t29-feed-fetch-manual.md) | ports + app | M (5h) | P0 | T11, T19 | gene.bilyy@gmail.com | todo | — |
| T30 | [Schedule daily feed fetches and route exhausted retries to the DLQ](./t30-feed-daily-cron.md) | app | S (3h) | P1 | T29 | gene.bilyy@gmail.com | todo | — |
| T31 | [Gate CI on AC-12 isolation coverage for every route and job](./t31-isolation-coverage-gate.md) | tests | M (4h) | P0 | T12, T13, T15, T17, T18, T26, T27, T28, T29 | gene.bilyy@gmail.com | todo | — |
| T32 | [Add the QG-2 price-processing load test to CI](./t32-qg2-load-test.md) | tests | L (6h) | P0 | T23 | gene.bilyy@gmail.com | todo | — |
| T33 | [Add the QG-3 k6 smoke running alongside a background import](./t33-qg3-k6-smoke.md) | tests | M (4h) | P0 | T26, T32 | gene.bilyy@gmail.com | todo | — |
| T34 | [Scaffold the Vue SPA with a typed client generated from openapi.yaml](./t34-spa-skeleton.md) | frontend | M (4h) | P0 | — | gene.bilyy@gmail.com | todo | — |
| T35 | [Build the catalog screens: upload wizard and readiness](./t35-ui-catalog.md) | frontend | L (6h) | P0 | T34 | gene.bilyy@gmail.com | todo | — |
| T36 | [Build supplier, price upload, feed and import-issues screens](./t36-ui-suppliers-imports.md) | frontend | L (8h) | P0 | T35 | gene.bilyy@gmail.com | todo | — |
| T37 | [Build the review queue with single and bulk decisions](./t37-ui-review-queue.md) | frontend | L (8h) | P0 | T34 | gene.bilyy@gmail.com | todo | — |
| T38 | [Build product offers, history, cancel and coverage screens](./t38-ui-offers-history-coverage.md) | frontend | L (6h) | P0 | T34 | gene.bilyy@gmail.com | todo | — |
| T39 | [Prepare the pilot VM deployment: compose, Caddy, backups, bucket lifecycle](./t39-pilot-deployment.md) | ops | M (4h) | P0 | T02, T07, T34 | gene.bilyy@gmail.com | todo | — |
| T40 | [Back-port downstream decisions into the SAD and PRD](./t40-upstream-backports.md) | docs | S (2h) | P0 | — | gene.bilyy@gmail.com | todo | — |

**Total:** 40 tasks, 204 h ≈ 25.5 person-days (P0: 201 h ≈ 25.1 d).

## Blockers on upstream open items

| Task | Waits for | Owner | Due |
|---|---|---|---|
| T22 → T23, T32, T33 | 2–3 real pilot price lists (PRD §8) | gene.bilyy@gmail.com | 2026-10-15 |
| T12 | TBD-4: shop SKU is a mandatory catalog column; TBD-2: archive semantics | gene.bilyy@gmail.com (PM) | before T12 starts |
| T27 | TBD-6: cancel semantics | PM | before T27 starts |
| T10 | TBD-5: price / availability format (works with a default) | gene.bilyy@gmail.com | 2026-10-15 |
| T39 → pilot | SAD §11 OQ: RequestContext source / auth scheme; security review | Security Lead | before pilot |
