// Integration tests run against the compose Postgres and MinIO unless DB_* / S3_* is set (CI).
const DEFAULTS: Record<string, string> = {
  DB_HOST: 'localhost',
  DB_PORT: '5434',
  DB_USER: 'pm',
  DB_PASSWORD: 'pm',
  DB_NAME: 'product_matching',
  S3_ENDPOINT: 'http://localhost:9100',
  S3_REGION: 'eu-central-1',
  S3_BUCKET: 'uploads',
  S3_ACCESS_KEY_ID: 'minioadmin',
  S3_SECRET_ACCESS_KEY: 'minioadmin',
  S3_FORCE_PATH_STYLE: 'true',
};

for (const [key, value] of Object.entries(DEFAULTS)) {
  process.env[key] ??= value;
}
