---
id: T34
title: "Scaffold the Vue SPA with a typed client generated from openapi.yaml"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: []
layer: "frontend"
module: "web"
epic: product-matching
updated_at: "2026-10-01"
---

# T34 — Scaffold the Vue SPA with a typed client generated from openapi.yaml

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** — · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [ADR-0001](../adr/0001-use-s-price-stack-nestjs-postgres-vue.md) — Vue 3.5 + Vite
- [openapi.yaml](../contracts/openapi.yaml)
- [SAD §8](../sad.md#8-crosscutting-concepts) — UI Ukrainian only, Europe/Kyiv time

## Scope

- Vite + Vue 3.5 + router, layout and nav (Каталог, Постачальники, Імпорти, Черга, Огляд).
- Typed client generated from openapi; problem+json error toast; dev token input (placeholder auth).
- Dev script that runs against `prism mock` so UI work does not wait for the backend.

## Definition of Ready

- [ ] openapi.yaml lint-clean (done).

## Definition of Done

- [ ] `npm run dev` against Prism renders every nav page; client regenerated in CI and diff-checked.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- Lane can start on day 1, in parallel with T01.
