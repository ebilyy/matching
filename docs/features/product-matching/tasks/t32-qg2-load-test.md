---
id: T32
title: "Add the QG-2 price-processing load test to CI"
status: todo
priority: P0
estimate: L  # 6 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: [T23]
layer: "tests"
module: "(tests/perf)"
epic: product-matching
updated_at: "2026-10-01"
---

# T32 — Add the QG-2 price-processing load test to CI

**Estimate:** L (6 h) · **Priority:** P0 · **Deps:** [T23](./t23-cascade-c-similarity.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [SAD §10](../sad.md#10-quality-requirements) QG-2
- [PRD §6](../PRD.md#6-non-functional-requirements) scale row (50 000 products, 10 suppliers, ≤ 100 000 rows)

## Scope

- Synthetic generator: 50 000 own products, 10 suppliers, a 50 000-row and a 100 000-row price with realistic code overlap.
- Measure `finished_at − created_at` for `applied`; fail above 10 min (p95 over N runs, or a single run with a margin, decide in PR).

## Definition of Ready

- [ ] T23 merged (full cascade).

## Definition of Done

- [ ] Nightly / manual CI job green; 100 000-row file completes without errors; numbers posted in the PR.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- If above 8 min, apply SAD §7 scaling thresholds before the pilot.
