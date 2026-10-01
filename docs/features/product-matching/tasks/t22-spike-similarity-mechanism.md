---
id: T22
title: "Spike: choose the similarity mechanism for cascade stage (c)"
status: todo
priority: P0
estimate: L  # 8 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: []
layer: "spike"
module: "matching"
epic: product-matching
updated_at: "2026-10-01"
---

# T22 — Spike: choose the similarity mechanism for cascade stage (c)

**Estimate:** L (8 h) · **Priority:** P0 · **Deps:** — · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [SAD §11](../sad.md#11-risks-and-technical-debt) Open question (owner gene.bilyy@gmail.com, due 2026-10-15)
- [AC-06](../PRD.md#5-acceptance-criteria), [AC-08](../PRD.md#5-acceptance-criteria), [AC-09](../PRD.md#5-acceptance-criteria)
- [PRD §6](../PRD.md#6-non-functional-requirements) QG-2, accuracy ≤ 1% false auto-matches
- [data-model](../data-model.md) → Indexes, «Свідомо не створено»

## Scope

- Timebox 1 day. Compare pg_trgm, in-memory search in the worker, and embeddings on 2–3 real price lists: recall@5, precision, time for 50 000 × 50 000.
- Propose the confidence formula and the low-confidence threshold (PRD §8 OQ, AC-09).
- Record the outcome as an ADR via `decide-adr`.

## Out of scope

- Production code.

## Definition of Ready

- [ ] **Real price lists from 2–3 pilot shops received** (PRD §8, due 2026-10-15).

## Definition of Done

- [ ] ADR merged with status Accepted, including the threshold value.
- [ ] Spike notebook / script committed under `docs/features/product-matching/_spikes/`.
- [ ] SAD §11 OQ row updated to point to the ADR.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- Can start the day the files arrive; nothing else blocks it.
