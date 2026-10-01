---
status: Accepted
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-10-01"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0007 — Split the monolith into eight NestJS modules with match-ledger as the sole event writer

- **Status:** Accepted
- **Date:** 2026-10-01
- **Deciders:** gene.bilyy@gmail.com (Architect, Socratic pass of sdlc:architecture-design)

## Context

Застосунок будується з нуля як модульний моноліт NestJS (ADR-0001). Журнал подій зіставлень (ADR-0004) пишуть і каскад імпорту (worker), і дії менеджера (api); каталог і прайси ділять конвеєр розбору файлів (ADR-0002). Межі модулів визначають, хто відповідає за інваріант «подія і проєкція — одна транзакція» і за безпеку вхідних файлів.

## Decision drivers

- QG-1: коректність — інваріант CONTEXT і консистентність журналу з проєкціями.
- PRD §6.1: один об'єкт для security review приймання файлів і URL.
- Розмір M, 1 інженер — не роздувати кількість модулів.

## Considered options

1. **8 модулів** — catalog, suppliers, file-intake, price-import, matching, match-ledger, review, offers.
2. **5 модулів** — catalog, suppliers (з price-import), file-intake, matching (каскад + журнал + черга + історія), offers.

## Decision outcome

**Chosen:** Option 1 — 8 модулів. Журнал подій і проєкції інкапсульовані в `match-ledger`: `matching` і `review` пишуть події лише через його сервіс, тож обійти правило «подія → проєкція в одній транзакції» неможливо. `file-intake` — єдина точка приймання файлів і URL для security review.

## Consequences

**Positive**
- Чітке володіння журналом подій і проєкціями.
- Безпека файлів і SSRF зосереджена в одному модулі.

**Negative**
- Більше стиків і DI-проводки для одного інженера.

**Neutral**
- Злиття модулів пізніше — рефакторинг на години, поки модулі не винесені в окремі сервіси.

## Links

- PRD: [[../PRD.md]] §4, §6.1
- SAD: [[../sad.md]] §5
- Related ADR: [[0002-upload-own-catalog-via-manager-ui-with-shared-import-pipeline]], [[0004-event-source-matches-and-decisions-with-inline-projections]]
