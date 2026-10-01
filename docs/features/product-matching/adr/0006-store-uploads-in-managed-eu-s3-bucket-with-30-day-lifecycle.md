---
status: Accepted
owner: "gene.bilyy@gmail.com"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-10-01"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0006 — Store uploaded originals in a managed EU S3-compatible bucket with 30-day lifecycle

- **Status:** Accepted
- **Date:** 2026-10-01
- **Deciders:** gene.bilyy@gmail.com (Architect, Socratic pass of sdlc:architecture-design)

## Context

`api` приймає файл прайсу чи каталогу, а розбирає його `worker` у фоні (ADR-0003); при зміні схеми колонок (AC-04) файл розбирається повторно після підтвердження розмітки. Оригінали — комерційна таємниця магазинів і постачальників (PRD §6.1). Потрібне місце, доступне обом процесам, з політикою видалення.

## Decision drivers

- PRD §6.1: дані confidential; security review — Required.
- AC-04: повторний розбір того самого файлу після підтвердження розмітки.
- ADR-0003: `api` і `worker` — окремі процеси.
- Бюджет 4 людино-тижні — мінімум операційної роботи.

## Considered options

1. **Docker-volume на VM** — спільний том для `api` і `worker`, щоденне видалення файлів старше 30 днів.
2. **S3-сумісне сховище** — далі уточнено: (2a) MinIO у compose на VM або (2b) керований bucket у ЄС.
3. **Тимчасово в Postgres (bytea)** — файл живе в БД до завершення імпорту.

## Decision outcome

**Chosen:** Option 2b — керований S3-сумісний bucket у регіоні ЄС (наприклад, Hetzner Object Storage або Cloudflare R2 з EU jurisdiction), шифрування на боці провайдера, lifecycle-правило видаляє об'єкти через 30 днів. Нічого не супроводжувати, `api` і `worker` не прив'язані до однієї VM, а код працює через S3 API, тож провайдера можна змінити конфігурацією.

## Consequences

**Positive**
- Немає власного диска з файлами й бекапу для нього; lifecycle — з коробки.
- `worker` можна винести на окрему машину без зміни коду.

**Negative**
- Конфіденційні прайси зберігаються у третьої сторони — новий пункт для security review і для умов з магазинами (idea-brief §15: чи можна передавати прайси третім особам).
- Новий секрет (ключі bucket) і зовнішня залежність: недоступність bucket = неможливо завантажити новий прайс (діє попередній, AC-03/AC-04).
- Щомісячна плата (невелика).

**Neutral**
- Перехід на MinIO або інший S3-провайдер — зміна endpoint і ключів.

## Links

- PRD: [[../PRD.md]] §5 AC-04; §6.1
- SAD: [[../sad.md]] §5
- Related ADR: [[0003-run-imports-in-worker-process-with-postgres-job-queue]]
