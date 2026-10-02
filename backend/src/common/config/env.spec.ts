import { parseDatabaseEnv, parseEnv } from './env';

const DB = {
  DB_HOST: 'localhost',
  DB_USER: 'pm',
  DB_PASSWORD: 'pm',
  DB_NAME: 'product_matching',
  S3_BUCKET: 'uploads',
};

describe('parseEnv', () => {
  it('applies defaults for a minimal env', () => {
    expect({ ...parseEnv({ ...DB, APP_ROLE: 'worker' }) }).toEqual({
      ...DB,
      DB_PORT: 5432,
      APP_ROLE: 'worker',
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
      LOG_FORMAT: 'json',
      S3_REGION: 'eu-central-1',
      S3_FORCE_PATH_STYLE: false,
    });
  });

  it.each([
    ['true', true],
    ['false', false],
  ])('parses S3_FORCE_PATH_STYLE=%s', (raw, parsed) => {
    expect(
      parseEnv({ ...DB, APP_ROLE: 'api', S3_FORCE_PATH_STYLE: raw })
        .S3_FORCE_PATH_STYLE,
    ).toBe(parsed);
  });

  it('requires the upload bucket', () => {
    expect(() =>
      parseEnv({ ...DB, APP_ROLE: 'api', S3_BUCKET: undefined }),
    ).toThrow(/S3_BUCKET/);
  });

  it('coerces PORT from a string', () => {
    expect(parseEnv({ ...DB, APP_ROLE: 'api', PORT: '8080' }).PORT).toBe(8080);
  });

  it('drops variables it does not declare', () => {
    expect(
      parseEnv({ ...DB, APP_ROLE: 'api', HOME: '/root' }),
    ).not.toHaveProperty('HOME');
  });

  it('rejects a non-numeric PORT', () => {
    expect(() => parseEnv({ ...DB, APP_ROLE: 'api', PORT: 'abc' })).toThrow(
      /PORT/,
    );
  });

  it.each([{}, { APP_ROLE: 'cron' }])('rejects APP_ROLE in %j', (raw) => {
    expect(() => parseEnv({ ...DB, ...raw })).toThrow(/APP_ROLE/);
  });

  it('requires the database connection', () => {
    expect(() => parseEnv({ APP_ROLE: 'api' })).toThrow(/DB_HOST/);
  });
});

describe('parseDatabaseEnv', () => {
  it('does not need APP_ROLE', () => {
    expect(parseDatabaseEnv({ ...DB, DB_PORT: '5434' }).DB_PORT).toBe(5434);
  });
});
