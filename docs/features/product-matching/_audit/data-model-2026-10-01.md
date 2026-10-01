# Data model + migrations report — product-matching (2026-10-01)

Skill: `generate-data-model` (stage 08+09), greenfield mode.

## Generated files

- `docs/features/product-matching/data-model.md`: ER diagram (rendered with mermaid-cli 11), 5 aggregates, 10 entity tables, 18 indexes with the query each one serves, test-fixture contract, 6 TBDs.
- `.claude/rules/migrations.md`: **bootstrapped** from the skill baseline, plus a "Project overrides — product-matching" section (see below).
- `migrations/`: 10 pairs, `.up.sql` + `.down.sql` each.

| # | Migration | Table |
|---|---|---|
| 1 | `20261001120000_create_shops` | `shops` |
| 2 | `20261001120001_create_managers` | `managers` |
| 3 | `20261001120002_create_own_products` | `own_products` |
| 4 | `20261001120003_create_suppliers` | `suppliers` |
| 5 | `20261001120004_create_imports` | `imports` |
| 6 | `20261001120005_create_supplier_positions` | `supplier_positions` |
| 7 | `20261001120006_create_match_events` | `match_events` |
| 8 | `20261001120007_create_matches` | `matches` (projection) |
| 9 | `20261001120008_create_match_proposals` | `match_proposals` (projection) |
| 10 | `20261001120009_create_remembered_decisions` | `remembered_decisions` (projection) |

## Verification

Run against a throwaway `postgres:18` container (18.6):

- up ×10: 10 tables, 33 indexes.
- up again: every statement is skipped with `already exists` (idempotent).
- down ×10 in reverse: 0 tables and 0 indexes left.
- up again after down: OK.
- Behaviour smoke: a match linking shop A's product to shop B's position is rejected by the composite FK. A position under another shop's supplier is rejected. A second event with the same `(pair, stream_version)` is rejected, which is the 409 path of flow 3.

Self-checks (all pass):

| Check | Result |
|---|---|
| Naming: plural snake_case tables | 10/10 |
| down.sql reversibility | Every `CREATE TABLE` / `CREATE INDEX` has a matching `DROP … IF EXISTS`; the roundtrip confirms it |
| FK indexes | 22/22 FKs covered. Checked in `pg_index`: the leading index columns equal the FK columns |
| Forbidden features | No `CHECK`, `TRIGGER`, `FUNCTION`, `DEFAULT '…'`, `SERIAL` / `IDENTITY` / `nextval` |

## Default deviations applied

- **Migration runner.** The skill emits golang-migrate-style SQL pairs, but ADR-0001 and SAD §2 fix TypeORM CLI. The SQL pairs are kept as the reviewed source. The rules override says each pair gets a thin TypeORM class that runs the file. Those classes are **not generated yet**, because the repo has no `src/` or `package.json`. They belong to the project-skeleton task.
- **Timestamp filenames** (`YYYYMMDDhhmmss_`) differ from the TypeORM default (`<epoch-ms>-Name.ts`). The wrapper class names carry the same timestamp, so ordering is preserved.
- **Projections have no UUID PK and no `created_at`.** They are keyed by the stream pair and carry event-derived times, because a rebuild rewrites rows (ADR-0004). This is recorded in the rules override.
- **No `stream_id` column.** The stream is identified by `(shop_id, own_product_id, supplier_position_id)`, and the uniqueness constraint is on that tuple plus `stream_version`. SAD §4 says "unique (stream_id, stream_version)", which means the same thing.
- **Table names pluralised against SAD.** `match_event` → `match_events`, `supplier_position` → `supplier_positions`, `match_view` → `matches`, `proposal_queue_view` → `match_proposals`, `remembered_decision_view` → `remembered_decisions`. **SAD §4, §6 and §12 still use the old names. Back-port is needed.**
- **FK-index rule interpretation.** A UNIQUE/PK constraint or a partial `WHERE fk IS NOT NULL` index whose leading columns equal the FK columns counts as the FK index. Without this rule, the hot `match_events` table would carry redundant indexes (QG-2 risk, ADR-0004).
- **`archived_at` on `own_products`.** This is a domain state (the SAD §11 default), not soft delete: matches stay valid. It is flagged as TBD-2 pending PM confirmation.
- **Test fixtures** are a TS contract in data-model.md, not Go files. The files get written together with the NestJS skeleton.
- **No seeds.** There are no lookup tables, and a bootstrap shop in a migration would ship to prod.

## Drift findings

Skipped: no domain code exists yet (no `src/`). Run `--drift-only` once the TypeORM entities exist.

## Breaking changes decomposed

None. This is greenfield, so `CONCURRENTLY` and the 3-step decomposition do not apply.

## TBDs

All six are in `docs/features/product-matching/data-model.md`, section "Open items (TBD)":

1. `updated_at` on the mutable-in-place tables: Backend Lead.
2. `archived_at` semantics for products dropped from a re-uploaded catalog: PM (SAD §11 asked for this before this stage).
3. Manager identity and how shops and managers are created: Security Lead, before the pilot.
4. A mandatory "shop SKU" column in the catalog mapping: needed for upsert and archiving, but missing from SAD US-01.
5. Price precision, currency/VAT, and availability format: decide against real price lists, due 2026-10-15.
6. Cancel semantics (sequences audit gap 2): PM.

## Upstream back-ports suggested

- SAD §4, §6, §12: table names (see above). Also `applied_at` → `imports.finished_at` in SAD §10 QG-2.
- SAD §6 US-01 flow: the catalog column mapping needs the shop SKU (TBD-4).
- SAD §4 cascade (a): it must consult `remembered_decisions` for rejections (sequences gap 1). The schema already supports this through a PK lookup.

## Next stage

`api-forge product-matching` (stage 10, API contracts), owned by Backend Lead.

Proposed commit: `08+09: data-model + migrations for product-matching`.
