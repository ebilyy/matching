---
id: T08
title: "Build the shared upload intake: limits, 30/h rate limit, import row + job in one tx"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
deps: [T05, T06, T07]
layer: "app/service"
module: "file-intake"
epic: product-matching
updated_at: "2026-10-01"
---

# T08 — Build the shared upload intake: limits, 30/h rate limit, import row + job in one tx

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T05](./t05-tenant-scoped-data-access.md), [T06](./t06-job-queue-infra.md), [T07](./t07-object-storage-adapter.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [ADR-0002](../adr/0002-upload-own-catalog-via-manager-ui-with-shared-import-pipeline.md) — one pipeline for catalog and prices
- [PRD §6.1](../PRD.md#61-security--privacy) — size, spam limits
- [SAD §8](../sad.md#8-crosscutting-concepts) — Вхідні файли й URL, Rate limiting
- [SAD §6](../sad.md#6-runtime-view) Critical flow 1, steps 1–5
- [api-sync-report](../contracts/api-sync-report.md) → D-12 (replay returns 200)

## Scope

- `FileIntakeService.accept(kind, file, mapping, idempotencyKey?)`: media type check (XLSX/CSV) → 415, size ≤ 50 MB → 413, `COUNT(imports) last hour ≥ 30` → 429.
- Stream file to storage (T07), then one transaction: insert `imports` (`queued`) + enqueue job.
- Optional `Idempotency-Key`: replay returns the existing import with 200 and is not counted (D-12).

## Out of scope

- Parsing (T09). Controllers live in catalog / price-import (T12, T18).

## Definition of Ready

- [ ] T05, T06, T07 merged.

## Definition of Done

- [ ] Integration tests: 413, 415, 429 (31st upload in an hour), replay → 200 with same id.
- [ ] Cross-shop: shop B's uploads do not count toward shop A's limit.
- [ ] A failure after S3 put but before commit leaves no `imports` row and no job.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
