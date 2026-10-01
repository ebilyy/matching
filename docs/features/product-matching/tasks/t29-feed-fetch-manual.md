---
id: T29
title: "Add manual feed fetch: endpoint + feed.fetch job with idempotency"
status: todo
priority: P0
estimate: M  # 5 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
deps: [T11, T19]
layer: "ports + app"
module: "suppliers, file-intake"
epic: product-matching
updated_at: "2026-10-01"
---

# T29 — Add manual feed fetch: endpoint + feed.fetch job with idempotency

**Estimate:** M (5 h) · **Priority:** P0 · **Deps:** [T11](./t11-ssrf-guarded-fetcher.md), [T19](./t19-price-import-upsert.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [openapi.yaml](../contracts/openapi.yaml) `fetchSupplierFeed`
- [events.md](../contracts/events.md) `feed.fetch` v1
- [SAD §6](../sad.md#6-runtime-view) US-02 feed flow
- [api-sync-report](../contracts/api-sync-report.md) → D-15 (no 429 in API)

## Scope

- Endpoint requires `Idempotency-Key`, 409 `supplier.feed_not_configured`, 202.
- Handler: key exists → no-op; 30/h used → reschedule +1 h; fetch (T11) → S3 → one tx: import (`source=feed`) + `price.import`.
- Non-retryable SSRF / size → `rejected`; retryable → retryLimit 3 with backoff.

## Out of scope

- Daily cron and DLQ alert (T30).

## Definition of Ready

- [ ] T11, T19 merged.

## Definition of Done

- [ ] Integration tests with a local HTTP stub: happy path, duplicate key, rate-limit reschedule, blocked address → rejected without retry.
- [ ] Cross-shop test.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
