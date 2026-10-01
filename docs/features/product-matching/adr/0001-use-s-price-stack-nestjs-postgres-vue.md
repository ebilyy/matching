---
status: Accepted
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
updated_at: "2026-10-01"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0001 — Use the s-price stack (NestJS 11 + TypeORM + Postgres 18 + Vue 3) for product-matching

- **Status:** Accepted
- **Date:** 2026-10-01
- **Deciders:** gene.bilyy@gmail.com (Architect, Socratic pass of sdlc:architecture-design)

## Context

product-matching — окремий застосунок, що будується з нуля (idea-brief §12, §15): код s-price не перевикористовується. Найскладніші нові здатності — розбір різноманітних прайсів і підбір схожих товарів за назвою (idea-brief §12). Бюджет — 4 людино-тижні без запасу, а команда щойно за ~3 тижні зібрала s-price на NestJS + TypeORM + Postgres + Vue. Стек визначає форму кожного модуля, міграцій, розгортання й найму, тож його треба зафіксувати до §4–§8 SAD.

## Decision drivers

- Бюджет 4 людино-тижні, розмір M, без запасу в графіку (SAD §2 Organisational; idea-brief §11–§12).
- QG-2: прайс ≤ 50 000 рядків p95 ≤ 10 хв (PRD §6) — потрібен потоковий розбір і масові операції в БД.
- Досвід команди: s-price (NestJS 11, TypeORM, Postgres 18.4, Vue 3, Docker Compose + Caddy).
- Один стек = одна модель даних і один набір міграцій для 1 інженера.

## Considered options

1. **Стек s-price** — TypeScript/Node 24 + NestJS 11 + TypeORM + Postgres 18.4 + Vue 3 SPA; розбір прайсів на Node (exceljs streaming, csv-parse), пошук схожих — у Postgres.
2. **s-price + Python-воркер** — API/UI на NestJS, розбір і фаззі-підбір в окремому Python-сервісі (pandas/openpyxl + rapidfuzz) над тією ж Postgres.
3. **Весь бекенд на Python** — FastAPI + SQLAlchemy + Postgres 18.4, фронт Vue 3.

## Decision outcome

**Chosen:** Option 1 — стек s-price. Нуль часу на вивчення й налаштування, копіюється форма модулів і compose-файлів s-price; слабшу екосистему Node для «брудних» таблиць компенсуємо тим, що важкі операції (пошук схожих, масові вставки) виконує Postgres, а не застосунок.

## Consequences

**Positive**
- Шаблон модуля, міграцій і розгортання вже відомий команді — бюджет іде на розбір і зіставлення, а не на інфраструктуру.
- Одна мова, одна модель даних, одні міграції.

**Negative**
- Бібліотеки Node для XLSX/CSV і фаззі-схожості менш зрілі за Python; дивні формати реальних прайсів (кілька аркушів, об'єднані комірки) можуть вимагати ручного коду.
- Обчислювально важкий розбір у Node блокує event loop — його треба винести з HTTP-процесу (див. SAD §4).

**Neutral**
- Python-воркер можна додати пізніше як окремий споживач тієї ж черги задач, якщо реальні прайси (PRD §8, due 2026-10-15) покажуть, що Node не справляється.

## Links

- PRD: [[../PRD.md]] §6, §8
- SAD: [[../sad.md]] §2
- Related ADR: —
