# product-matching — frontend

SPA на Vue 3.5 + Vite ([ADR-0001](../docs/features/product-matching/adr/0001-use-s-price-stack-nestjs-postgres-vue.md)):
Vue Router, Pinia, Vuetify 4 (компоненти), Tailwind 4 (утиліти для розкладки), TypeScript.
Інтерфейс лише українською, час показується в Europe/Kyiv (SAD §8).

Задача-скелет — [T34](../docs/features/product-matching/tasks/t34-spa-skeleton.md); екрани наповнюють T35–T38.

## Структура

```
frontend/
├── src/
│   ├── main.ts            Pinia + router + Vuetify
│   ├── App.vue            розкладка: app bar з dev-токеном, навігація, тости
│   ├── api/
│   │   ├── schema.d.ts    ЗГЕНЕРОВАНО з openapi.yaml (npm run api:generate) — не редагувати
│   │   └── client.ts      openapi-fetch: Bearer-токен + тост для кожної помилки problem+json
│   ├── stores/            auth (dev-токен), notifications (черга тостів)
│   ├── pages/             Каталог, Постачальники (+ картка), Імпорти, Черга, Огляд, Магазини (+ менеджери)
│   ├── components/        спільні компоненти
│   ├── composables/       useLoad — завантаження ресурсу при монтуванні
│   ├── plugins/vuetify.ts
│   ├── styles/main.css    порядок CSS-шарів Vuetify ↔ Tailwind
│   └── utils/format.ts    дата/час у Europe/Kyiv, відсотки
├── .env.development       адреса локального api для проксі (npm run dev)
└── .env.mock              проксі на Prism для npm run dev:mock
```

## Запуск

Node 24 (`.nvmrc`).

```bash
npm install
npm run dev:mock   # Vite :5173 + Prism mock :4010 з openapi.yaml — бекенд не потрібен
npm run dev        # Vite :5173, /api і /health проксіюються на localhost:3000 (docker compose з кореня)
```

Адреса API:

| Змінна | Де | Значення за замовчуванням |
|---|---|---|
| `API_PROXY_TARGET` | `.env.development`, `.env.mock` | `http://localhost:3000` (dev) / `http://127.0.0.1:4010` (mock) — куди Vite проксіює `/api` і `/health` |
| `VITE_API_BASE_URL` | `.env.development` або `.env.local` | порожньо = той самий origin (проксі Vite / Caddy). Шляхи вже містять `/api/v1`, тож тут лише origin, напр. `http://localhost:3000`; тоді api має дозволяти CORS |

У полі «Магазин (dev)» в app bar оберіть магазин: його id стає bearer-токеном. Це тимчасова заміна
RequestContext до T03 (бекенд: `ShopContextGuard`), без неї тенантні ендпоінти (`/suppliers`…) відповідають 401.
Справжню схему автентифікації ще не обрано (SAD §11).

## Контракт API

Типи клієнта генеруються з [openapi.yaml](../docs/features/product-matching/contracts/openapi.yaml):

```bash
npm run api:generate   # після зміни контракту
npm run api:check      # для CI: перегенерувати й упасти, якщо schema.d.ts розійшовся з контрактом
```

Виклики типізовані за шляхом: `api.GET('/api/v1/suppliers/{supplier_id}', { params: { path: { supplier_id } } })`.

## Стилі: Vuetify + Tailwind

Обидві бібліотеки кладуть CSS у cascade layers. У `src/styles/main.css` порядок шарів задано так,
що утиліти Tailwind перекривають Vuetify без `!important`. Preflight Tailwind не підключено:
скидання стилів робить Vuetify. Компоненти беремо з Vuetify, Tailwind — для відступів, flex/grid і дрібних правок.

## Перевірки

```bash
npm run lint         # oxlint + eslint
npm run type-check   # vue-tsc
npm test             # vitest
npm run build
```
