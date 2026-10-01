---
id: T26
title: "Add bulk-confirm preview and bulk confirm (≤ 1 000)"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T24, T25]
layer: "ports + app"
module: "review"
epic: product-matching
updated_at: "2026-10-01"
---

# T26 — Add bulk-confirm preview and bulk confirm (≤ 1 000)

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T24](./t24-review-queue-list.md), [T25](./t25-review-confirm-reject.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [openapi.yaml](../contracts/openapi.yaml) `previewBulkConfirm`, `bulkConfirmMatchProposals`
- [AC-09](../PRD.md#5-acceptance-criteria)
- [SAD §6](../sad.md#6-runtime-view) Critical flow 4
- [PRD §6](../PRD.md#6-non-functional-requirements) bulk p95 ≤ 10 s
- [api-sync-report](../contracts/api-sync-report.md) → D-10

## Scope

- Preview: total, low-confidence count, items with stream versions; > 1 000 → 422 `match_proposal.bulk_limit_exceeded`.
- Bulk: one ledger transaction; pairs decided meanwhile are skipped and reported.

## Definition of Ready

- [ ] T24, T25 merged.

## Definition of Done

- [ ] Integration test: 1 000 proposals confirmed in one call under 10 s locally; skipped pairs reported; each history entry has the manager and time (AC-09).
- [ ] Cross-shop test.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
