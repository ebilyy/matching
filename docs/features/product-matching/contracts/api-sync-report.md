---
status: Draft
owner: "Backend Lead"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-10-01"
feature_size: M
stage: "10"
ticket: "<TBD>"
---

# API sync report — product-matching (2026-10-01)

Skill: `api-forge` (stage 10), initial run. **Scenario A**: `data-model.md` is present, so the contract is derived from the model.

## Inputs

| Input | Status | Used for |
|---|---|---|
| `PRD.md` | found (hard gate) | US-01…US-08 and AC-01…AC-18 → endpoints; §6 limits (page 50, bulk ≤ 1 000, latency names); §6.1 upload limits, SSRF, 30/h |
| `data-model.md` + `migrations/2026100112000{0..9}` | found → scenario A | Every field, type, `maxLength`, enum, nullability; UNIQUE → error codes |
| `sad.md` §6 | found: 4 critical flows + 4 US flows (container-level, no endpoint-level) | `alt` branches → 404 / 409 / 202; async actors → jobs and `Idempotency-Key` |
| `sad.md` §8 | found | Error format (RFC 9457, 409, 422), RequestContext, upload limits |
| `idea-brief.md` | found | `info.description` ("why this API exists") |
| `adr/0001…0008` | found, all Accepted | Stack, catalog upload (0002), async worker (0003), stream identity and concurrency (0004), tenancy (0008). No ADR overrides versioning or auth |
| `.claude/rules/openapi.md` | **missing → bootstrapped** in this run | Defaults baseline the skill refers to |
| existing `contracts/openapi.yaml` | none | Initial run |

## Outputs

- [`openapi.yaml`](./openapi.yaml): OpenAPI 3.1.0, 30 operations (29 under `/api/v1` plus `/health`), 20 error codes, examples on every operation.
- [`events.md`](./events.md): 3 pg-boss job contracts (`catalog.import`, `price.import`, `feed.fetch` plus DLQ) and the ledger event envelope with 6 types.
- `.claude/rules/openapi.md`: defaults baseline plus product-matching overrides.

## Endpoint map

| Operation | Method / path | US / AC | Source flow | Data access |
|---|---|---|---|---|
| uploadCatalog | `POST /api/v1/catalog/imports` | US-01, ADR-0002 | SAD US-01 | INSERT `imports` (kind=catalog) + job |
| getCatalogReadiness | `GET /api/v1/catalog/readiness` | AC-01 | SAD US-01 | COUNT `own_products` |
| listOwnProducts | `GET /api/v1/own-products` | US-06, US-08 entry point | — | SELECT `own_products` |
| getOwnProductOffers | `GET /api/v1/own-products/{id}/offers` | AC-16, AC-17, AC-18 | SAD US-08 | `matches` ⨝ `supplier_positions` ⨝ `suppliers`; `match_proposals` |
| getOwnProductHistory | `GET /api/v1/own-products/{id}/history` | AC-13, AC-14 | SAD US-06 | SELECT `match_events` ⨝ `managers` |
| listSuppliers / createSupplier / getSupplier / updateSupplier | `/api/v1/suppliers[/{id}]` | AC-02 precondition, AC-18; update: F-2 | — | `suppliers` |
| uploadSupplierPrice | `POST /api/v1/suppliers/{id}/price-imports` | US-02, AC-02…AC-04 | flow 1, 2 | INSERT `imports` (kind=price) + job |
| fetchSupplierFeed | `POST /api/v1/suppliers/{id}/feed-fetches` | US-02 (feed) | SAD US-02 | job `feed.fetch` (import row created by worker) |
| listImports / getImport | `/api/v1/imports[/{id}]` | AC-02, AC-03, AC-04 | flow 1 (polling), 2 | SELECT `imports` |
| confirmImportMapping | `POST /api/v1/imports/{id}/confirm-mapping` | AC-04 | flow 2 | UPDATE `suppliers.column_mapping`, `imports.status` + job |
| listMatchProposals | `GET /api/v1/match-proposals` | AC-08, US-04 | — | `match_proposals` keyset |
| previewBulkConfirm | `GET /api/v1/match-proposals/bulk-confirm-preview` | AC-09 | flow 4 | COUNT / SELECT `match_proposals` by brand/category |
| bulkConfirmMatchProposals | `POST /api/v1/match-proposals/bulk-confirm` | AC-09 | flow 4 | batch INSERT `match_events` + projections |
| confirmMatchProposal | `POST /api/v1/match-proposals/{op}/{sp}/confirm` | AC-08 | flow 3 | INSERT `match_events` (ProposalConfirmed) + projections |
| rejectMatchProposal | `POST /api/v1/match-proposals/{op}/{sp}/reject` | AC-10 | flow 3 | INSERT `match_events` (ProposalRejected) + projections |
| cancelMatch | `POST /api/v1/matches/{op}/{sp}/cancel` | AC-13 | SAD US-06 | INSERT `match_events` (MatchCancelled) + projections |
| getCoverage | `GET /api/v1/coverage` | AC-15 | (US-07 trivial) | COUNT DISTINCT `matches.own_product_id`, COUNT `match_proposals` |
| listShops / createShop / getShop / updateShop | `/api/v1/shops[/{shop_id}]` (operator, D-16) | — | — | `shops` |
| listManagers / createManager / getManager / updateManager | `/api/v1/shops/{shop_id}/managers[/{manager_id}]` (operator, D-16) | AC-14 (actor name) | — | `managers` |
| getHealth | `GET /health` | — | SAD §7 | none |

## Section A — field origins

Grouped by schema, because schemas are reused via `$ref` across operations. Confidence: **high** = a column in `data-model.md` with a matching type, or a pure derivation from one; **medium** = derived from PRD/SAD text or a JSONB column whose inner shape the model leaves open; **low** = inferred from sequence message names only (none in this run).

| Schema path | Origin | Confidence |
|---|---|---|
| `OwnProduct.{id, sku, name, barcode, manufacturer_code, brand, category, archived_at, created_at}` | `own_products.*` | high |
| `CatalogReadiness.own_products_total` | `COUNT(own_products) WHERE archived_at IS NULL` | high (exclusion of archived: medium, see D-11) |
| `CatalogReadiness.without_reliable_code` | `… AND barcode IS NULL AND manufacturer_code IS NULL` (AC-01) | high |
| `CatalogUpload.file` / `PriceUpload.file` | → S3, `imports.storage_key`, `imports.original_filename` | high |
| `CatalogUpload.column_mapping` / `PriceUpload.column_mapping` | `imports.column_mapping` | high |
| `ColumnMapping.columns[].{header, role}` | JSONB inner shape: "заголовки + роль кожної колонки" (data-model). Order kept for AC-04 | medium |
| `ColumnRole` enum | Target columns of `own_products` / `supplier_positions` that are filled from a file | medium |
| `Supplier.{id, name, feed_url, column_mapping, price_date, created_at}` | `suppliers.*` | high |
| `Supplier.{email, phone, website, description}`, same in `SupplierCreate` / `SupplierUpdate` | `suppliers.*` (migration `20261001120010_add_contacts_to_suppliers`) | high |
| `SupplierUpdate` (merge patch: absent = unchanged, `null` = cleared) | `UPDATE suppliers` of the card fields; `column_mapping` and `price_date` change only through imports | high |
| `Supplier.is_price_stale` | `price_date < now() − 7 days` (AC-18) | high |
| `SupplierCreate.feed_url` / `SupplierUpdate.feed_url` pattern `^https?://` | PRD §6.1 | high |
| `SupplierWebsite` pattern `^https?://` | Contract choice: the UI renders it as a link, so only http(s) | medium |
| `SupplierRef.{id, name}` | `suppliers.id, name` | high |
| `SupplierPosition.{id, supplier_code, name, barcode, manufacturer_code, brand, price, in_stock, stock_quantity, absent_since}` | `supplier_positions.*` | high |
| `SupplierPosition.supplier` | join `suppliers` | high |
| `FeedFetchAccepted.{supplier_id, idempotency_key}` | path param; header → `imports.idempotency_key` (SAD US-02 `supplier_id + request_id`) | medium |
| `Import.{id, kind, source, status, supplier_id, original_filename, column_mapping, issues, rows_recognized, auto_matched_count, proposals_count, created_at, started_at, finished_at}` | `imports.*` | high |
| `Import.uploaded_by` (`Actor`) | `imports.manager_id` (NULL = system) ⨝ `managers.display_name` | high |
| `ImportIssues.{missing_roles, invalid_cells, invalid_cells_total, column_diff}` | `imports.issues` JSONB: "некоректні колонки й рядки (обрізаний до перших N) або відмінності схеми" (AC-03, AC-04) | medium (N = 100 is a contract choice) |
| `ImportIssues.rejection_reason` enum | PRD §6.1 limits; SAD §6 US-02 feed rejection branches; SAD §8 limits | medium |
| `Actor.{kind, manager_id, display_name}` | `manager_id IS NULL` → `system`; `managers.display_name` | high |
| `StreamRef.*`, `DecisionRequest.stream_version` | `match_events.stream_version` / projection `stream_version` (ADR-0004) | high |
| `MatchProposal.{reason, confidence, explanation, stream_version, proposed_at}` | `match_proposals.*` | high |
| `MatchProposal.{own_product, supplier_position}` | join by PK | high |
| `MatchProposal.is_low_confidence` | AC-09; threshold lives in code (PRD §8) | medium |
| `ProposalExplanation.{matched, mismatched, changed, ambiguous_code}` | `match_proposals.explanation` JSONB: "які ознаки збіглися / ні, що змінилось" (AC-07, AC-08, AC-11) | medium |
| `Feature` enum | Comparable features present on both sides (`barcode`, `manufacturer_code`, `supplier_code`, `name`, `brand`) | medium |
| `BulkConfirmPreview.{total, low_confidence_count, items}` | SAD flow 4 ("N пропозицій, з них L … + версії потоків") | medium (items: high) |
| `BulkConfirmResult.{confirmed_count, skipped_count, skipped}` | SAD flow 4 ("створено X, пропущено Y") | medium |
| `Match.{own_product_id, supplier_position_id, origin, stream_version, matched_at}` | `matches.*` | high |
| `RememberedDecision.{own_product_id, supplier_position_id, decision, stream_version, decided_at}` | `remembered_decisions.*` | high |
| `MatchEvent.{id, type, stream_version, import_id}` | `match_events.*` | high |
| `MatchEvent.occurred_at` | `match_events.created_at` | high |
| `MatchEvent.actor` | `match_events.manager_id` ⨝ `managers` | high |
| `MatchEvent.supplier_position` | join by `supplier_position_id` | high |
| `MatchEvent.explanation.{matched_code, remembered, changed, confidence}` | `match_events.payload` JSONB: "код збігу, що змінилось у відбитку, впевненість" + AC-05, AC-10 | medium |
| `Offer.{match_origin, matched_at, stream_version}` | `matches.*` | high |
| `Offer.price_date`, `Offer.is_price_stale` | `suppliers.price_date`, AC-18 | high |
| `Offer.absent_in_latest_price` | `supplier_positions.absent_since IS NOT NULL` (AC-17) | high |
| `Candidate.{reason, confidence, stream_version}` | `match_proposals.*` | high |
| `Candidate.confirmed` (`const false`) | AC-16 | high |
| `Coverage.{own_products_total, matched_own_products, pending_proposals}` | COUNT `own_products`, COUNT DISTINCT `matches.own_product_id`, COUNT `match_proposals` (AC-15) | high |
| `Coverage.coverage_ratio` | `matched / total` | high |
| `Error.{code, message, status, details}` | SAD §8 (RFC 9457) + api-forge default `{code, message, details?}` | medium |
| `Health.status` | SAD §7 `/health` | medium |

**Intentionally not exposed:** `shop_id` everywhere (comes from the credential, ADR-0008); `supplier_positions.{position_key, fingerprint, created_at}`; `imports.{idempotency_key, storage_key}`; `match_events.schema_version`; `remembered_decisions.fingerprint`; `match_proposals.{brand, category}` (denormalised copies, exposed through `own_product`).

## Section B — drift findings (5-point)

| # | Check | Result |
|---|---|---|
| 1 | **Endpoint ↔ data-model** | ✓ All 29 business endpoints map to ≥ 1 query or mutation on a data-model table (Endpoint map above). `/health` touches no table, by design. |
| 2 | **Error codes ↔ domain sentinels** | ✗ **Not verifiable: no `src/` exists yet.** The 17 codes are listed below as the sentinel catalog to create with the NestJS skeleton. Constraint-derived codes are covered: `uq_match_events_stream_version` → `match_proposal.already_decided` / `match.version_conflict` (409); `uq_imports_shop_id_idempotency_key` → idempotent replay (200, not an error); `uq_own_products_shop_id_sku` → upsert key (not an error); composite FKs plus the `shop_id` filter → `*.not_found` (404, AC-12). |
| 3 | **Validation ↔ DB constraints** | ✓ Every `maxLength` equals its `VARCHAR(N)`: sku 100, own and position name 500, barcode 32, manufacturer_code 100, brand 200, category 500, supplier name 200, supplier email 254, supplier phone 32, supplier_code 100, original_filename 255, display_name 200, Idempotency-Key 200 (160 for feed, so `uuid:` + key fits 200). `price` NUMERIC(14,4) → decimal string `^-?\d{1,10}(\.\d{1,4})?$`. `confidence` NUMERIC(4,3) → `0..1` (3-decimal precision documented, not enforced: `multipleOf` on floats is unreliable). `feed_url`, `website`, `description` TEXT → no `maxLength`. All enums equal the documented values in data-model (`kind`, `source`, `status`, `origin`, `reason`, `decision`, `type`). No PRD-vs-DDL conflicts. |
| 4 | **Entity ↔ endpoint** | ✓ with notes. 8/10 tables are served. `supplier_positions` appears only embedded (proposals, offers, history), with no standalone endpoint, by design. `remembered_decisions` appears only as the response of reject and cancel. **Internal:** `shops` (created by an operator, implicit through the credential) and `managers` (only `display_name` via `Actor`; identity is an open question, TBD-3). |
| 5 | **OpenAPI ↔ sequence** | ✓ Every status code drawn in SAD §6 is in the spec: US-01 202, US-02 202, US-06 404 / 409, US-08 404, flow 3 409. Flow 1 polling → `getImport`; flow 2 "передає розмітку" → `confirmImportMapping` (202); flow 4 → preview + bulk. The SAD sequences are container-level and name no methods or paths, so method/path alignment can only be checked after back-port (follow-up F-1). No orphan sequences: the cron feed branch is a job, not an endpoint. |

**Core checks:** 1 ✓, 2 ✗ (not verifiable, greenfield), 3 ✓. **Check 2 needs an explicit waiver** until the skeleton exists, or the sentinel catalog below should be adopted as the source the code is generated from.

### Proposed sentinel catalog (`src/common/errors/`)

| Code | HTTP | Raised by (module, ADR-0007) |
|---|---|---|
| `common.unauthenticated` | 401 | `common` (RequestContext guard) |
| `common.validation_failed` | 422 | `common` (ValidationPipe → 422, not the NestJS default 400) |
| `common.internal` | 500 | `common` (exception filter) |
| `own_product.not_found` | 404 | `catalog`, `offers`, `match-ledger` |
| `supplier.not_found` | 404 | `suppliers`, `price-import` |
| `supplier.feed_not_configured` | 409 | `suppliers` |
| `import.not_found` | 404 | `file-intake` |
| `import.file_too_large` | 413 | `file-intake` |
| `import.unsupported_media_type` | 415 | `file-intake` |
| `import.invalid_column_mapping` | 422 | `file-intake` |
| `import.rate_limited` | 429 | `file-intake` |
| `import.not_awaiting_mapping` | 409 | `price-import` |
| `match_proposal.not_found` | 404 | `review` |
| `match_proposal.already_decided` | 409 | `review` ← `match-ledger` unique violation |
| `match_proposal.bulk_limit_exceeded` | 422 | `review` |
| `match.not_found` | 404 | `review` |
| `match.version_conflict` | 409 | `review` ← `match-ledger` unique violation |

## Section C — unresolved_origins

Empty (scenario A).

## Deviations from defaults

| # | Default | Contract | Why |
|---|---|---|---|
| D-1 | `application/json` `{code, message, details?}` | `application/problem+json` (RFC 9457) with `code`, `message`, `status`, `details` | SAD §8 fixes RFC 9457. Not an ADR, so this is a reconciliation, not an override: both shapes are satisfied. RFC clients that read `detail` will not find text; `message` carries it. |
| D-2 | `BearerAuth` as the real scheme | `BearerAuth` kept as a **placeholder** | Authentication is out of scope (PRD §3). The RequestContext source is an open question for Security Lead before the pilot (SAD §11). |
| D-3 | Cursor = UUID v7 | Opaque string | The queue keyset is `(confidence DESC, own_product_id, supplier_position_id)`, not an id. Other lists encode the UUID v7 in the same opaque form for one client rule. |
| D-4 | `Idempotency-Key` on every mutating POST | Only on uploads (optional, stored in `imports.idempotency_key`) and feed fetch (**mandatory**: SAD US-02 retries 3×). Decisions use `stream_version` instead | There is no store for keys on decisions. Optimistic concurrency already makes a retry harmless: a repeat returns 409 whose `details.decided_by` is the caller, and the bulk call reports those pairs as skipped. |
| D-5 | Every list is cursor-paginated | `getOwnProductHistory` is not | data-model: "подій на товар одиниці", sorted in memory. |
| D-6 | Resources have UUID ids | Proposals and matches are addressed by the pair `/{own_product_id}/{supplier_position_id}` | Projections are keyed by the stream (ADR-0004, rules override). |
| D-7 | Enum values snake_case | `MatchEventType` is PascalCase (`AutoMatched`, …) | Verbatim from data-model / `match_events.type`, so there is no mapping layer to drift. |
| D-8 | Everything under `/api/v1` | `/health` at the root, `security: []` | SAD §7 names `/health` for the uptime probe. |
| D-17 | `Idempotency-Key` on mutating + retriable PATCH | `updateSupplier` has none | Every field of the merge patch is an absolute value, so a retried PATCH writes the same state again. |
| D-16 | `shop_id` never in paths (ADR-0008 override) | `operator` endpoints `/shops`, `/shops/{shop_id}`, `/shops/{shop_id}/managers…` take `shop_id` from the path | Shops and managers are managed by an operator across tenants, so there is no RequestContext shop to scope by. Access will be limited by role (guard pending); until then these endpoints are as open as the rest of the API. Not derived from PRD/SAD: needs owner confirmation and an ADR for the shops/managers modules beyond ADR-0007. |

## Contract decisions beyond the sources (need owner confirmation)

None of these contradicts a source; each fills a gap the sources leave open. Owner: Backend Lead unless noted.

- **D-9** A decided proposal → 409, a never-proposed pair → 404. The handler must check the ledger stream, not only `match_proposals`, because a decided pair has no queue row.
- **D-10** A bulk filter over 1 000 proposals is refused at preview (422 `match_proposal.bulk_limit_exceeded`), not truncated. PRD §6 says "до 1 000".
- **D-11** Archived products are excluded from readiness (AC-01) and coverage (AC-15). Owner: PM, tied to TBD-2.
- **D-12** An upload replay with the same `Idempotency-Key` returns the existing import with **200** (first time: 202) and does not count toward 30/h.
- **D-13** `ImportIssues.invalid_cells` is truncated to 100 entries, plus `invalid_cells_total`.
- **D-14** `ColumnMapping` is an ordered array of `{header, role|null}`. This fixes the JSONB shape that data-model leaves as "заголовки + роль".
- **D-15** The feed's 30/h limit is not checked in the API: the worker reschedules (SAD US-02), so `fetchSupplierFeed` has no 429.

## Follow-ups (supporting checks and gaps)

- **F-1** Back-port to SAD §6: resolve `<!-- TODO: align with openapi.yaml -->` in US-02, and optionally add `### Endpoint-level:` sequences for `confirmMatchProposal` and `cancelMatch` so check 5 can compare methods and paths.
- **F-2** ~~No way to change a supplier after creation.~~ Done: `PATCH /api/v1/suppliers/{id}` (`updateSupplier`) edits the name, contacts and `feed_url`; added together with the supplier contacts (2026-10-01).
- **F-3** `listOwnProducts` has no search or filter (by SKU, name, "no reliable code"). No AC asks for it. With 50 000 products, US-08 ("для кожного власного товару") will probably need it.
- **F-4** Gap 3 from `_audit/sequences-2026-10-01.md` (does a catalog re-upload re-run the cascade?) is still open. The contract is unaffected either way: it would be one more job, not an endpoint.
- **F-5** Retry policy for `catalog.import` / `price.import` jobs is TBD (`events.md`).
- **F-6** Pre-existing: SAD §6 Critical flow 3 fails `mmdc` because of the `;` in a message (noted in the sequences audit; not edited, since this skill does not edit sources).
- **F-7** Spectral is not wired into a check target because there is no `Makefile` / `package.json` yet. When the skeleton lands, add `npx @stoplight/spectral-cli lint docs/features/*/contracts/openapi.yaml` and `npx @redocly/cli lint …` to CI.

## Verification

- `spectral lint` (`spectral:oas` ruleset, CLI 6): **0 errors, 0 warnings**.
- `redocly lint` (recommended ruleset): **valid**, 3 warnings accepted: no `info.license` (internal API), `localhost` server (the local dev server), and `/health` has no 4xx.
- Prism 5 mock (`prism mock contracts/openapi.yaml -p 4010`), smoke test: 10/10 calls as expected. 200s with examples on `/health`, readiness, queue, offers, import, coverage, confirm; 422 on `stream_version: 0`; 409 via `Prefer: code=409`; 401 without a token.

## DoD self-check

| Item | State |
|---|---|
| Contract at `contracts/openapi.yaml` | ✓ (uncommitted) |
| Lint pass | ✓ Spectral + Redocly |
| Examples on all operations (request + success + error) | ✓ |
| Error model with codes | ✓ 17 codes, `<module>.<error_name>` |
| Mock server up | ✓ Prism on :4010 (local) |
| Core checks 1–3 ✓ or waived | ⚠ check 2 needs a waiver (no code yet) |
| Scenario recorded | ✓ A |

**Next:** Decision owner → stage 11 ADRs. Candidates surfaced here: D-1 (error format, to make SAD §8 + the default an ADR), D-4 (idempotency through `stream_version`), and the RequestContext / auth scheme (already an OQ in SAD §11).

Proposed commit: `10: API contract for product-matching via api-forge`.
