---
id: T39
title: "Prepare the pilot VM deployment: compose, Caddy, backups, bucket lifecycle"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
deps: [T02, T07, T34]
layer: "ops"
module: "(deploy)"
epic: product-matching
updated_at: "2026-10-01"
---

# T39 — Prepare the pilot VM deployment: compose, Caddy, backups, bucket lifecycle

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T02](./t02-migrations-wiring.md), [T07](./t07-object-storage-adapter.md), [T34](./t34-spa-skeleton.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [SAD §7](../sad.md#7-deployment-view)
- [ADR-0006](../adr/0006-store-uploads-in-managed-eu-s3-bucket-with-30-day-lifecycle.md) — EU bucket, 30-day lifecycle
- [ADR-0003](../adr/0003-run-imports-in-worker-process-with-postgres-job-queue.md) — api / worker roles

## Scope

- Prod compose: caddy 2.10 (TLS, SPA, reverse proxy), api, worker, postgres 18.4, one-shot migrate, daily `pg_dump` to the backup bucket.
- Bucket(s) in the EU region with SSE and a 30-day lifecycle rule on uploads; secrets via env file outside git.
- Runbook: deploy, rollback, restore from backup.

## Out of scope

- Monitoring tool (SAD §11 OQ, before pilot).

## Definition of Ready

- [ ] T02, T07, T34 merged.
- [ ] Provider chosen (Hetzner Object Storage or Cloudflare R2 EU).

## Definition of Done

- [ ] Staging VM up from the runbook; `/health` green via Caddy; migrations applied on staging; a restore from last night's dump tested once.
- [ ] Lifecycle rule verified in the provider console (screenshot in the PR).
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- Pilot with real price lists still needs the auth decision and security review (SAD §11 High risk).
