---
id: T38
title: "Build product offers, history, cancel and coverage screens"
status: todo
priority: P0
estimate: L  # 6 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T34]
layer: "frontend"
module: "web"
epic: product-matching
updated_at: "2026-10-01"
---

# T38 — Build product offers, history, cancel and coverage screens

**Estimate:** L (6 h) · **Priority:** P0 · **Deps:** [T34](./t34-spa-skeleton.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [AC-13](../PRD.md#5-acceptance-criteria), [AC-14](../PRD.md#5-acceptance-criteria), [AC-15](../PRD.md#5-acceptance-criteria), [AC-16](../PRD.md#5-acceptance-criteria), [AC-17](../PRD.md#5-acceptance-criteria), [AC-18](../PRD.md#5-acceptance-criteria)
- [SAD §6](../sad.md#6-runtime-view) US-06, US-08 flows
- [SAD §11](../sad.md#11-risks-and-technical-debt) — cut: cancel UI minimal

## Scope

- Own-products list → product page: confirmed offers with price date, «відсутня в останньому прайсі», «застаріло»; candidates block «не підтверджено».
- History timeline (system with explanation / manager); cancel button (minimal).
- Coverage overview «92% каталогу зіставлено, лишилось 312 пропозицій».

## Definition of Ready

- [ ] T34 merged.

## Definition of Done

- [ ] e2e against Prism for AC-15…AC-18 rendering and cancel 409.
- [ ] Manual check against the real API once T27/T28 are merged.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
