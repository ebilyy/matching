---
id: T03
title: "Add RequestContext, problem+json errors, 422 validation and cursor codec"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
deps: [T01]
layer: "crosscutting"
module: "common"
epic: product-matching
updated_at: "2026-10-01"
---

# T03 — Add RequestContext, problem+json errors, 422 validation and cursor codec

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T01](./t01-project-skeleton.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [SAD §8](../sad.md#8-crosscutting-concepts) — Request context, Error handling, Logging rows
- [rules/openapi.md](../../../../.claude/rules/openapi.md) → Project overrides
- [api-sync-report](../contracts/api-sync-report.md) → Proposed sentinel catalog, D-1, D-2, D-3
- [events.md](../contracts/events.md) → Common rules (jobs carry RequestContext)

## Scope

- `RequestContext {shop_id, manager_id}` in AsyncLocalStorage, plus `runInContext()` for jobs.
- **Placeholder** credential guard: a dev bearer token resolves to a fixed shop + manager from config. It is clearly marked as temporary (the real source is the SAD §11 Open question).
- Exception filter → `application/problem+json` with `code`, `message`, `status`, `details`; the 17 sentinel codes from the sync report as typed errors.
- Global `ValidationPipe` returning 422 `common.validation_failed`.
- Opaque cursor codec (base64url of a keyset tuple) shared by all list endpoints.
- Contract-test helper: integration tests validate responses against `openapi.yaml`.

## Out of scope

- Choosing the real auth scheme (SAD §11 OQ, Security Lead, before pilot).

## Definition of Ready

- [ ] T01 merged.

## Definition of Done

- [ ] Unit tests: context propagation across `await`, filter maps each sentinel to its HTTP status.
- [ ] Request without a token → 401 `common.unauthenticated`, body validates against the openapi `Error` schema.
- [ ] Invalid body → 422, not 400.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- The placeholder guard must refuse to start when `NODE_ENV=production` and no real scheme is configured, so it cannot ship to the pilot by accident.
