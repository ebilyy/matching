---
id: T01
title: "Scaffold the NestJS app with api/worker roles and local compose"
status: todo
priority: P0
estimate: L  # 8 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: []
layer: "foundation"
module: "(root), infrastructure"
epic: product-matching
updated_at: "2026-10-01"
---

# T01 — Scaffold the NestJS app with api/worker roles and local compose

**Estimate:** L (8 h) · **Priority:** P0 · **Deps:** — · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [ADR-0001](../adr/0001-use-s-price-stack-nestjs-postgres-vue.md) — stack and versions
- [ADR-0003](../adr/0003-run-imports-in-worker-process-with-postgres-job-queue.md) — one image, two roles
- [ADR-0007](../adr/0007-split-monolith-into-eight-nest-modules-with-ledger-as-sole-event-writer.md) — module list
- [SAD §5](../sad.md#5-building-block-view) — folder layout
- [SAD §8](../sad.md#8-crosscutting-concepts) — logging row
- [SAD §7](../sad.md#7-deployment-view) — compose services

## Scope

- `package.json`, TS 5.7, Node 24, NestJS 11, ESLint + Prettier, Jest (unit + integration projects).
- Entrypoint selects role by `APP_ROLE=api|worker`; `api` serves HTTP only, `worker` starts no HTTP listener.
- Empty Nest modules for all eight ADR-0007 modules plus `infrastructure/` and `common/` (folders only, no logic).
- `nestjs-pino` JSON logger with `request_id`; a redaction list placeholder for price and cell fields.
- `GET /health` per `getHealth` in [openapi.yaml](../contracts/openapi.yaml).
- `docker-compose.dev.yml`: `postgres:18.4`, MinIO (dev stand-in for the EU bucket), `api`, `worker`.
- CI workflow: install → lint → typecheck → unit → integration (Postgres service container).

## Out of scope

- Business logic, entities and migrations wiring (T02).

## Definition of Ready

- [ ] ADR-0001, ADR-0003, ADR-0007 Accepted (done).

## Definition of Done

- [ ] `docker compose -f docker-compose.dev.yml up` starts api and worker; `curl :3000/health` → 200 matching the openapi example.
- [ ] Worker process has no open HTTP port (asserted in an integration test or compose healthcheck).
- [ ] CI pipeline green on the PR.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- Copy the shape of `schemka-backend`, not its code ([SAD §5](../sad.md#5-building-block-view) conventions).
