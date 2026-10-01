---
id: T40
title: "Back-port downstream decisions into the SAD and PRD"
status: todo
priority: P0
estimate: S  # 2 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
deps: []
layer: "docs"
module: "docs"
epic: product-matching
updated_at: "2026-10-01"
---

# T40 — Back-port downstream decisions into the SAD and PRD

**Estimate:** S (2 h) · **Priority:** P0 · **Deps:** — · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- data-model report → Upstream back-ports
- [api-sync-report](../contracts/api-sync-report.md) → F-1, F-6
- [sequences audit](../_audit/sequences-2026-10-01.md) gaps 1–4
- [SAD §11](../sad.md#11-risks-and-technical-debt) — PRD §3 non-goal back-port

## Scope

- SAD §4/§6/§12 table names (`match_events`, `matches`, …), `applied_at` → `finished_at`, cascade (a) consults remembered rejections, US-01 mapping needs shop SKU.
- Fix the `;` in SAD Critical flow 3 so `mmdc` renders it.
- PRD §3: catalog upload is no longer a non-goal (ADR-0002).

## Out of scope

- New decisions.

## Definition of Ready

- [ ] None.

## Definition of Done

- [ ] `mmdc` renders every SAD §6 block; grep finds no old table names in SAD.
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- Can be done any time; best before T16 so the ledger code and SAD use the same names.
