---
id: T37
title: "Build the review queue with single and bulk decisions"
status: todo
priority: P0
estimate: L  # 8 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T34]
layer: "frontend"
module: "web"
epic: product-matching
updated_at: "2026-10-01"
---

# T37 — Build the review queue with single and bulk decisions

**Estimate:** L (8 h) · **Priority:** P0 · **Deps:** [T34](./t34-spa-skeleton.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [AC-08](../PRD.md#5-acceptance-criteria), [AC-09](../PRD.md#5-acceptance-criteria)
- [SAD §6](../sad.md#6-runtime-view) Critical flows 3–4
- [openapi.yaml](../contracts/openapi.yaml) review operations

## Scope

- Queue sorted by confidence with explanation (matched / mismatched / changed); brand / category filters; infinite scroll by cursor.
- Confirm / reject in one click with `stream_version`; 409 → «вже вирішено (ким)».
- Bulk: preview warning «L з N — низька впевненість», then result «створено X, пропущено Y».

## Definition of Ready

- [ ] T34 merged.

## Definition of Done

- [ ] e2e against Prism: confirm removes the row; 409 message; bulk warning flow.
- [ ] Manual check against the real API once T26 is merged.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
