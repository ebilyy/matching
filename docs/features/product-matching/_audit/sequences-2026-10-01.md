# Sequence coverage audit — product-matching (2026-10-01)

Skill: `sdlc:complete-sequence-diagrams`. All new blocks validated with `mmdc` 12.0.0 (full render).

Note: the existing §6 flows are titled `Critical flow N`, not `### US-N`, so coverage was mapped by content. The table at the top of the new §6 sub-block records the mapping.

## Added

- **US-01** — catalog upload through the shared pipeline (ADR-0002), rejected-import branch, readiness counts (AC-01).
- **US-02 (feed)** — daily cron and manual "fetch now" trigger, idempotency key, rate-limit reschedule, SSRF-guarded GET, retry ×3 with backoff, DLQ, alert. File upload was already covered by Critical flow 1/2.
- **US-06** — cancel as the `MatchCancelled` event with optimistic concurrency (409), 404 for a foreign shop, history read from `match_event` (AC-13, AC-14).
- **US-08** — offers read: confirmed-only purchase data, "absent in latest price" (AC-17), stale > 7 days (AC-18), candidates marked "not confirmed" (AC-16), 404.

## Covered (unchanged)

- US-02 (file), US-03, US-05 — Critical flow 1/2.
- US-04 — Critical flow 3/4.

## Skipped (trivial)

- **US-07** — coverage numbers are a SELECT on the inline projections, which ADR-0004 updates in the same transaction, so "updates after each decision" holds without extra flow.

## New actors flagged

- None. The feed scheduler is pg-boss cron inside `worker` (§5 already lists "фіди за розкладом").
- **New pseudo-identity:** `manager_id = system` for scheduled jobs. It must fit the RequestContext OQ (§11) and the AC-14 history ("system automatically").

## Gaps surfaced while drawing (not decided — need owner)

1. **Cascade (a) must respect manager rejections.** AC-13 says that a cancelled pair is not recreated automatically. However, §4 orders the cascade a → b → c, and stage (a) (exact code) would recreate a cancelled code-based auto-match on the next price. Stage (a) has to consult `remembered_decision_view` for rejections. Update §4.
2. **Cancel semantics.** The US-06 diagram assumes that a cancel equals a remembered rejection with the current fingerprint, so the pair is not re-proposed until the fingerprint changes. The alternative is to drop the remembered confirmation only and re-propose the pair to the queue. Confirm with PM.
3. **Catalog re-upload → cascade re-run?** New own products are not matched against existing supplier positions until the next price import. Decide whether a catalog import enqueues a cascade run.
4. **Feed failures have no notification channel.** `rejected` / `awaiting_mapping` / DLQ for a feed are visible only in the import list and in ops alerts.

## ADR potential

- **US-02:** consider an ADR for the retry budget shape and DLQ handling for feed fetch. The diagram uses 3 retries with exponential backoff, a non-retryable class for SSRF/size violations, and an idempotency key `supplier_id + date`.
- **US-06:** consider an ADR (or an ADR-0004 amendment) for cancel semantics and the interaction between rejections and cascade stage (a). See gaps 1–2.
- **US-01:** consider an ADR for re-running the cascade after a catalog import (gap 3) if the answer is "yes". This is a new job type plus a QG-2 load.

## DoD self-check

- 8/8 US accounted for: 4 covered by existing flows, 3 added (US-01, US-06, US-08) plus the US-02 feed supplement, and 1 trivial (US-07).
- mmdc passed on all new blocks.

## Pre-existing issue (not modified — skill is additive-only)

- **Critical flow 3** fails `mmdc`. The `;` in `API-->>M1: зіставлення створено; ціна й наявність…` acts as a Mermaid statement separator. Fix by hand: replace `;` with `—`.
