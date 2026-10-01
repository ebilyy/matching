---
id: T36
title: "Build supplier, price upload, feed and import-issues screens"
status: todo
priority: P0
estimate: L  # 8 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T35]
layer: "frontend"
module: "web"
epic: product-matching
updated_at: "2026-10-01"
---

# T36 — Build supplier, price upload, feed and import-issues screens

**Estimate:** L (8 h) · **Priority:** P0 · **Deps:** [T35](./t35-ui-catalog.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [AC-02](../PRD.md#5-acceptance-criteria), [AC-03](../PRD.md#5-acceptance-criteria), [AC-04](../PRD.md#5-acceptance-criteria), [AC-18](../PRD.md#5-acceptance-criteria)
- [SAD §6](../sad.md#6-runtime-view) Critical flows 1–2, US-02 feed
- [openapi.yaml](../contracts/openapi.yaml) suppliers + imports operations

## Scope

- Supplier list (stale marker) and create; price upload via the wizard; «Оновити зараз» for feeds.
- Imports list; rejected issues (column, rows, «ціна має бути числом»); `awaiting_mapping` diff and confirm.

## Definition of Ready

- [ ] T35 merged.

## Definition of Done

- [ ] e2e against Prism: rejected import shows cell errors (AC-03); awaiting mapping shows the diff and confirms (AC-04).
- [ ] Manual check against the real API once T18/T29 are merged.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
