// Integration tests run against the compose Postgres unless DB_* is set (CI).
const DEFAULTS: Record<string, string> = {
  DB_HOST: 'localhost',
  DB_PORT: '5434',
  DB_USER: 'pm',
  DB_PASSWORD: 'pm',
  DB_NAME: 'product_matching',
};

for (const [key, value] of Object.entries(DEFAULTS)) {
  process.env[key] ??= value;
}
