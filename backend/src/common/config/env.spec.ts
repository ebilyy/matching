import { parseEnv } from './env';

describe('parseEnv', () => {
  it('applies defaults for a minimal env', () => {
    expect({ ...parseEnv({ APP_ROLE: 'worker' }) }).toEqual({
      APP_ROLE: 'worker',
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
      LOG_FORMAT: 'json',
    });
  });

  it('coerces PORT from a string', () => {
    expect(parseEnv({ APP_ROLE: 'api', PORT: '8080' }).PORT).toBe(8080);
  });

  it('drops variables it does not declare', () => {
    expect(parseEnv({ APP_ROLE: 'api', HOME: '/root' })).not.toHaveProperty(
      'HOME',
    );
  });

  it('rejects a non-numeric PORT', () => {
    expect(() => parseEnv({ APP_ROLE: 'api', PORT: 'abc' })).toThrow(/PORT/);
  });

  it.each([{}, { APP_ROLE: 'cron' }])('rejects APP_ROLE in %j', (raw) => {
    expect(() => parseEnv(raw)).toThrow(/APP_ROLE/);
  });
});
