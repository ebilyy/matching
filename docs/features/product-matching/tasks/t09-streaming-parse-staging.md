---
id: T09
title: "Stream-parse XLSX/CSV into a session TEMP staging table"
status: todo
priority: P0
estimate: L  # 8 h
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
deps: [T02, T07]
layer: "app/service"
module: "file-intake"
epic: product-matching
updated_at: "2026-10-01"
---

# T09 — Stream-parse XLSX/CSV into a session TEMP staging table

**Estimate:** L (8 h) · **Priority:** P0 · **Deps:** [T02](./t02-migrations-wiring.md), [T07](./t07-object-storage-adapter.md) · **Owner:** gene.bilyy@gmail.com

## Upstream (source of truth, do not duplicate here)

- [ADR-0005](../adr/0005-upsert-supplier-positions-in-place-after-staging-validation.md) — staging before touching live rows
- [SAD §8](../sad.md#8-crosscutting-concepts) — 100 000 rows, unzipped ≤ 200 MB, formulas not evaluated
- [PRD §6.1](../PRD.md#61-security--privacy) — archive bombs
- [api-sync-report](../contracts/api-sync-report.md) → D-14 (ColumnMapping shape)

## Scope

- exceljs streaming reader (first sheet) and csv-parse; encoding detection for CSV (UTF-8 / CP1251).
- Read cached values only; never evaluate formulas.
- Guards: unzipped size ≤ 200 MB, rows ≤ 100 000 → `rejected` with `rejection_reason`.
- Apply `ColumnMapping` (ordered `{header, role|null}`) and COPY rows into a `TEMP` staging table of the worker session.
- Return header list for the schema-diff step (T10).

## Out of scope

- Validation and normalisation (T10).

## Definition of Ready

- [ ] T02, T07 merged.
- [ ] Ideally 1–2 real price files from PRD §8 OQ (due 2026-10-15) as fixtures; synthetic ones are enough to start.

## Definition of Done

- [ ] Unit/integration tests with fixtures: XLSX, CSV CP1251, a zip bomb (rejected), a 100 001-row file (rejected), a cell with a formula (cached value used).
- [ ] 100 000-row file parses with bounded memory (heap < 300 MB in the test).
- [ ] Common DoD from [_epic.md](./_epic.md#common-definition-of-done) met.

## Notes

- SAD §11 High risk: odd formats (several sheets, merged cells). If real files break the parser, raise it before T19 starts.
