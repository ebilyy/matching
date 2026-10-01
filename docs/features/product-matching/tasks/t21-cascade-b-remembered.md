---
id: T21
title: "Implement cascade stage (b): remembered decisions and fingerprint change"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T20]
layer: "domain + app"
module: "matching"
epic: product-matching
updated_at: "2026-10-01"
---

# T21 — Implement cascade stage (b): remembered decisions and fingerprint change

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T20](./t20-cascade-a-exact-code.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [SAD §4](../sad.md#4-solution-strategy) strategy 2 (b)
- [AC-10](../PRD.md#5-acceptance-criteria), [AC-11](../PRD.md#5-acceptance-criteria), [AC-12](../PRD.md#5-acceptance-criteria)
- [events.md](../contracts/events.md) `ReturnedToQueue`
- PRD §8 OQ (fingerprint = supplier code + name, default)

## Scope

- Remembered `confirmed` + same fingerprint → `AutoMatched` (`remembered: true`).
- Matched pair whose position fingerprint changed → `ReturnedToQueue` with `changed: [Feature]`.
- Remembered `rejected` + same fingerprint → no proposal.

## Definition of Ready

- [ ] T20 merged.

## Definition of Done

- [ ] Integration tests for AC-10 and AC-11.
- [ ] AC-12: shop B's remembered decisions on the same real supplier do not affect shop A.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.
