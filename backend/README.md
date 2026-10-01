# product-matching — backend

Модульний моноліт на NestJS 11 (Node 24, TypeScript 5.7) з Postgres 18.4 і S3-сумісним сховищем (локально MinIO).
Один образ запускається у двох ролях ([ADR-0003](../docs/features/product-matching/adr/0003-run-imports-in-worker-process-with-postgres-job-queue.md)):

- `api` — HTTP API на порту 3000;
- `worker` — фонова обробка без HTTP-слухача (черга pg-boss з'явиться в T06).

Роль задається змінною `APP_ROLE=api|worker`.

Архітектура: [SAD](../docs/features/product-matching/sad.md), задачі: [tasks/](../docs/features/product-matching/tasks/), контракт API: [openapi.yaml](../docs/features/product-matching/contracts/openapi.yaml).

## Структура

```
backend/
├── migrations/            SQL-пари *.up.sql / *.down.sql — джерело правди схеми (підключення до TypeORM — T02)
├── src/
│   ├── main.ts            точка входу: читає APP_ROLE і запускає api або worker
│   ├── bootstrap.ts       createApiApp() / createWorkerApp() — використовуються й у тестах
│   ├── api.module.ts      роль api: config + logging + домен + /health
│   ├── worker.module.ts   роль worker: config + logging + домен, без HTTP
│   ├── domain.module.ts   вісім модулів з ADR-0007
│   ├── modules/           catalog, suppliers, file-intake, price-import, matching, match-ledger, review, offers
│   ├── infrastructure/    database (TypeORM), jobs (pg-boss), storage (S3) — поки порожні
│   ├── common/
│   │   ├── config/        перевірка env через class-validator
│   │   └── logging/       nestjs-pino: JSON, request_id, role, redaction
│   ├── health/            GET /health
│   └── worker/            keep-alive, доки немає pg-boss
└── test/                  інтеграційні тести (*.int-spec.ts) + перевірка відповідей за openapi.yaml
```

Модулі в `modules/` поки порожні: їх наповнюють наступні задачі.

## Швидкий старт (Docker)

Потрібен Docker з Compose v2. Команди запускаються з **кореня репозиторію**:

```bash
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml ps
curl -i localhost:3000/health        # → 200 {"status":"ok"}
```

У `api` і `worker` працює hot reload: каталог `backend/src` змонтовано в контейнери, і після збереження файлу застосунок перезбирається сам.
Після змін у `package.json`, `tsconfig*.json` або `Dockerfile` образ треба перебудувати (`up -d --build`).

Зупинка:

```bash
docker compose -f docker-compose.dev.yml down       # дані зберігаються
docker compose -f docker-compose.dev.yml down -v    # разом з даними Postgres і MinIO
```

### Сервіси та порти

| Сервіс | Образ | Порт на хості | Доступ |
|---|---|---|---|
| `api` | `backend/Dockerfile` (target `dev`) | `3000` (`API_PORT`) | http://localhost:3000/health |
| `worker` | той самий образ | — | лише логи |
| `postgres` | `postgres:18.4` | `5434` (`POSTGRES_PORT`) | `pm` / `pm`, БД `product_matching` |
| `minio` | `bitnamilegacy/minio:2025.7.23-debian-12-r5` | `9100` API, `9101` консоль | `minioadmin` / `minioadmin`, bucket `uploads` |

Порти змінюються через `.env` у корені репо. Типові значення не 5432 і 9000, щоб не конфліктувати з іншими локальними стендами.
Офіційні образи `minio/minio` більше не публікуються, тому використано заморожену збірку Bitnami. Це лише dev-замінник керованого bucket у ЄС ([ADR-0006](../docs/features/product-matching/adr/0006-store-uploads-in-managed-eu-s3-bucket-with-30-day-lifecycle.md)).

## Запуск без Docker

Потрібен Node 24 (`nvm use` прочитає `.nvmrc`).

```bash
cd backend
npm ci
cp .env.example .env
npm run start:api       # в одному терміналі
npm run start:worker    # в іншому
```

`main.ts` підвантажує `backend/.env`, але вже задані змінні середовища мають пріоритет.
Postgres і MinIO можна взяти з compose: `docker compose -f docker-compose.dev.yml up -d postgres minio` (з кореня репо).

## Змінні середовища

| Змінна | Значення | Типово | Використовується |
|---|---|---|---|
| `APP_ROLE` | `api` \| `worker` | — (обов'язкова) | зараз |
| `NODE_ENV` | `development` \| `test` \| `production` | `development` | зараз |
| `PORT` | 0–65535 | `3000` | зараз (лише `api`) |
| `LOG_LEVEL` | `fatal` … `trace`, `silent` | `info` | зараз |
| `LOG_FORMAT` | `json` \| `pretty` | `json` | зараз |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | | див. `.env.example` | з T02 |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | | див. `.env.example` | з T07 |

Невалідне значення зупиняє запуск з повідомленням `Invalid environment: ...`. Нові змінні треба додати в клас `Env` у [src/common/config/env.ts](src/common/config/env.ts).

## Скрипти

| Команда | Що робить |
|---|---|
| `npm run start:dev` | запуск з `--watch` (роль береться з `APP_ROLE`) |
| `npm run start:api` / `start:worker` | те саме з уже заданою роллю |
| `npm run build` / `start:prod` | збірка в `dist/` і запуск `node dist/main` |
| `npm run lint` / `lint:fix` | ESLint + Prettier |
| `npm run format` | Prettier для `src/` і `test/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | unit-тести (`src/**/*.spec.ts`) |
| `npm run test:int` | інтеграційні тести (`test/**/*.int-spec.ts`) |
| `npm run test:all` | обидва набори |

## Як перевірити, що все працює

Команди з кореня репо, стенд піднятий.

1. **Стан сервісів.** У `docker compose -f docker-compose.dev.yml ps` сервіси `api`, `postgres` і `minio` мають статус `(healthy)`, а `worker` — `Up` (не `Restarting`).
2. **Health.**
   ```bash
   curl -i localhost:3000/health
   curl -i localhost:3000/health -H 'X-Request-Id: my-test-1'
   ```
   Очікується `200`, тіло `{"status":"ok"}` і заголовок `x-request-id`. У другому запиті він має дорівнювати `my-test-1`.
3. **Логи.** `/health` навмисно не логується, тому для перевірки потрібен інший шлях:
   ```bash
   curl -s localhost:3000/api/v1/anything >/dev/null
   docker compose -f docker-compose.dev.yml logs api --tail 1
   ```
   Має бути JSON-рядок з полями `"request_id"` і `"role":"api"`.
4. **Worker без HTTP.**
   ```bash
   docker compose -f docker-compose.dev.yml logs worker | grep "worker started"
   docker exec product-matching-worker-1 netstat -tln
   ```
   У логах має бути `worker started (no HTTP listener)`. У `netstat` допустимий лише `127.0.0.11:<порт>` — це вбудований DNS Docker, а не застосунок.
5. **Postgres.** Команда `docker exec product-matching-postgres-1 psql -U pm -d product_matching -c "select version();"` має показати `PostgreSQL 18.4`.
6. **MinIO.** На http://localhost:9101 (вхід `minioadmin` / `minioadmin`) має бути bucket `uploads`.
7. **Hot reload.** Змініть файл у `backend/src` і виконайте `docker compose -f docker-compose.dev.yml logs -f api`. Мають з'явитися рядки `File change detected...` і `api listening on :3000`.
8. **Тести.** У каталозі `backend`: `npm run lint && npm run typecheck && npm run test:all` — усе має пройти без помилок.

## Домовленості

- **Логи** — JSON (pino). Кожен рядок містить `role`, рядки, записані під час обробки запиту, — ще й `request_id`. Ціни та вміст комірок прайсів не логуються ([SAD §8](../docs/features/product-matching/sad.md#8-crosscutting-concepts)). Список полів, які приховуються, — у [src/common/logging/redact.ts](src/common/logging/redact.ts); його треба доповнювати разом із новими полями логів.
- **Маршрути** — під префіксом `/api/v1`, крім `/health`.
- **Новий ендпоінт** — інтеграційний тест має перевіряти відповідь функцією `expectResponseToMatch(operationId, res)` з [test/support/openapi.ts](test/support/openapi.ts).
- **Міграції** — правила в `.claude/rules/migrations.md`. SQL-файли в `migrations/` не редагуються: зміни схеми йдуть новою парою файлів.
