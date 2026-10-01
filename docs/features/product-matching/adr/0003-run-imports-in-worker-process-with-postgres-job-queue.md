---
status: Accepted
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead"]
updated_at: "2026-10-01"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0003 — Run imports in a separate worker process with a Postgres-backed job queue (pg-boss)

- **Status:** Accepted
- **Date:** 2026-10-01
- **Deciders:** gene.bilyy@gmail.com (Architect, Socratic pass of sdlc:architecture-design)

## Context

Обробка прайсу (розбір + автозіставлення + підготовка черги) для 50–100k рядків триває хвилини, а щоденні фіди запускаються без участі менеджера (SAD §3). Розбір у Node блокує event loop, тож у HTTP-процесі він погіршив би відгук черги підтвердження. Потрібен механізм фонових задач із повторами й розкладом.

## Decision drivers

- QG-2: обробка прайсу ≤ 50 000 рядків p95 ≤ 10 хв (PRD §6).
- QG-3: сторінка черги p95 ≤ 1 с, рішення p95 ≤ 300 мс — і під час імпорту (PRD §6).
- Postgres 18.4 — єдине сховище (SAD §2, ADR-0001); бюджет 4 людино-тижні.
- Щоденне забирання фідів (SAD §3) потребує cron.

## Considered options

1. **Worker-процес + черга в Postgres (pg-boss)** — той самий образ у ролях `api` і `worker`; задачі в таблиці Postgres, вибірка через `FOR UPDATE SKIP LOCKED`, повтори й cron вбудовані.
2. **Worker + BullMQ на Redis** — ті самі процеси, черга в Redis.
3. **Фонова обробка в API-процесі** — без окремого worker (setImmediate / worker_threads).

## Decision outcome

**Chosen:** Option 1. Жодної нової інфраструктури, задача створюється в одній транзакції із записом про імпорт (немає «імпорт записаний, задача загубилась»), а пропускної здатності Postgres-черги з запасом вистачає на десятки задач на годину.

## Consequences

**Positive**
- Розбір і каскад ізольовані від HTTP за CPU і пам'яттю; рестарт `api` не губить імпорт.
- Розклад фідів, повтори й таймаути задач — з коробки.

**Negative**
- Додатковий контейнер `worker` у compose і в моніторингу.
- Черга навантажує ту саму Postgres, що й застосунок (незначно при нашому обсязі).

**Neutral**
- Перехід на Redis/BullMQ пізніше локалізований у модулі задач — бізнес-код бачить лише інтерфейс «поставити задачу».

## Links

- PRD: [[../PRD.md]] §6
- SAD: [[../sad.md]] §4
- Related ADR: [[0001-use-s-price-stack-nestjs-postgres-vue]]
