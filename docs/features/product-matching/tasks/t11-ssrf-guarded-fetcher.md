---
id: T11
title: "Implement the SSRF-guarded HTTP fetcher for supplier feeds"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Security Lead"]
deps: [T01]
layer: "infra"
module: "file-intake"
epic: product-matching
updated_at: "2026-10-01"
---

# T11 — Implement the SSRF-guarded HTTP fetcher for supplier feeds

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T01](./t01-project-skeleton.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [PRD §6.1](../PRD.md#61-security--privacy) — SSRF abuse case
- [SAD §8](../sad.md#8-crosscutting-concepts) — Вхідні файли й URL row
- [SAD §6](../sad.md#6-runtime-view) US-02 feed flow, SSRF branch
- [events.md](../contracts/events.md) → `feed.fetch` guards

## Scope

- http(s) only; resolve DNS and block private, loopback, link-local and 169.254.169.254 (IPv4 + IPv6).
- Connect to the resolved IP (no second lookup → no DNS rebinding).
- Re-check on every redirect (≤ 3); timeout 30 s; abort above 50 MB.
- Typed errors: `feed_blocked_address`, `feed_size_limit` (non-retryable) vs timeout / 5xx (retryable).

## Out of scope

- Queue handling, idempotency (T29).

## Definition of Ready

- [ ] T01 merged.

## Definition of Done

- [ ] Unit tests: 10.x, 127.0.0.1, ::1, 169.254.169.254, redirect to private, 4 redirects, 51 MB body, slow body > 30 s.
- [ ] Security Lead approves the PR.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
