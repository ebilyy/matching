---
status: Accepted
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-10-01"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0008 — Isolate shops by shop_id column with an enforced repository filter and composite foreign keys

- **Status:** Accepted
- **Date:** 2026-10-01
- **Deciders:** gene.bilyy@gmail.com (Architect, Socratic pass of sdlc:architecture-design)

## Context

Усі пілотні магазини живуть в одній базі Postgres (SAD §2, §7). Прайси й закупівельні ціни — комерційна таємниця (PRD §6.1), а рішення кожного магазину мають бути ізольовані (AC-12): магазини можуть працювати з тим самим постачальником. Забутий фільтр в одному запиті покаже магазину A дані магазину B. Модель ізоляції торкається кожної таблиці й запиту у всіх 8 модулях (ADR-0007).

## Decision drivers

- AC-12: рішення кожного магазину ізольовані; PRD §1 Decision overrides — ізоляція є мінімумом цієї ітерації.
- PRD §6.1: дані confidential, security review — Required.
- Стек TypeORM + сирий SQL для каскаду й проєкцій (ADR-0001, ADR-0004).
- Бюджет 4 людино-тижні; 3 пілотні магазини.

## Considered options

1. **`shop_id` + обов'язковий фільтр** — колонка в кожній таблиці, складені FK `(shop_id, id)`, базовий репозиторій додає фільтр із RequestContext.
2. **Як 1 + Postgres row-level security** — політики БД за `current_setting('app.shop_id')`, `SET LOCAL` у кожній транзакції.
3. **Окрема схема на магазин** — однакові таблиці в N схемах, перемикання `search_path`.

## Decision outcome

**Chosen:** Option 1. Найпростіше з TypeORM і pg-boss, а складені зовнішні ключі не дають БД фізично зв'язати рядки різних магазинів. Ризик людської помилки в сирому SQL закривається хелпером, що вимагає `shop_id`, і інтеграційним тестом AC-12 на кожен ендпоінт і задачу.

## Consequences

**Positive**
- Немає залежності від транзакційної дисципліни для RLS; прості міграції.
- Складені FK — захист на рівні цілісності даних, не лише фільтрів.

**Negative**
- Забутий фільтр у новому сирому SQL-запиті не зупиняє БД — лише тести й рев'ю.
- `shop_id` додає по колонці й по полю в кожен індекс.

**Neutral**
- RLS можна додати пізніше поверх тієї самої колонки `shop_id` без міграції даних (лише політики й ролі).

## Links

- PRD: [[../PRD.md]] §1 Decision overrides, §5 AC-12, §6.1
- SAD: [[../sad.md]] §8
- Related ADR: [[0007-split-monolith-into-eight-nest-modules-with-ledger-as-sole-event-writer]]
