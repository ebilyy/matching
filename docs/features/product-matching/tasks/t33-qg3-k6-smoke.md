---
id: T33
title: "Add the QG-3 k6 smoke running alongside a background import"
status: todo
priority: P0
estimate: M  # 4 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T26, T32]
layer: "tests"
module: "(tests/perf)"
epic: product-matching
updated_at: "2026-10-01"
---

# T33 — Add the QG-3 k6 smoke running alongside a background import

**Estimate:** M (4 h) · **Priority:** P0 · **Deps:** [T26](./t26-review-bulk-confirm.md), [T32](./t32-qg2-load-test.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [SAD §10](../sad.md#10-quality-requirements) QG-3
- [PRD §6](../PRD.md#6-non-functional-requirements) queue / decide / bulk latencies, ≥ 20 req/s

## Scope

- k6 scenarios: queue page, single decide, bulk 1 000; run while the T32 import is in progress.

## Definition of Ready

- [ ] T26, T32 merged.

## Definition of Done

- [ ] CI job reports p95 per scenario and fails over: list 1 s, decide 300 ms, bulk 10 s; throughput ≥ 20 req/s.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- SAD §11 Medium risk: row locks during upsert vs decide p95.
