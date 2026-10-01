import { Expose, plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export const APP_ROLES = ['api', 'worker'] as const;
export type AppRole = (typeof APP_ROLES)[number];

const NODE_ENVS = ['development', 'test', 'production'] as const;
const LOG_LEVELS = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
] as const;
// json — for docker/prod (SAD §8); pretty — for a local terminal only.
const LOG_FORMATS = ['json', 'pretty'] as const;

// Separate from Env so the migration CLI (T02) can run without APP_ROLE.
export class DatabaseEnv {
  @Expose()
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @Expose()
  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number = 5432;

  @Expose()
  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @Expose()
  @IsString()
  DB_PASSWORD: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  DB_NAME: string;
}

export class Env extends DatabaseEnv {
  @Expose()
  @IsIn(APP_ROLES)
  APP_ROLE: AppRole;

  @Expose()
  @IsIn(NODE_ENVS)
  NODE_ENV: (typeof NODE_ENVS)[number] = 'development';

  @Expose()
  @IsInt()
  @Min(0)
  @Max(65535)
  PORT: number = 3000;

  @Expose()
  @IsIn(LOG_LEVELS)
  LOG_LEVEL: (typeof LOG_LEVELS)[number] = 'info';

  @Expose()
  @IsIn(LOG_FORMATS)
  LOG_FORMAT: (typeof LOG_FORMATS)[number] = 'json';
}

export function parseEnv(raw: Record<string, unknown>): Env {
  return validateInto(Env, raw);
}

export function parseDatabaseEnv(raw: Record<string, unknown>): DatabaseEnv {
  return validateInto(DatabaseEnv, raw);
}

function validateInto<T extends object>(
  cls: new () => T,
  raw: Record<string, unknown>,
): T {
  const env = plainToInstance(cls, raw, {
    enableImplicitConversion: true,
    excludeExtraneousValues: true,
    exposeDefaultValues: true,
  });
  const errors = validateSync(env);
  if (errors.length > 0) {
    const details = errors
      .map(
        (e) =>
          `  ${e.property}: ${Object.values(e.constraints ?? {}).join('; ')}`,
      )
      .join('\n');
    throw new Error(`Invalid environment:\n${details}`);
  }
  return env;
}
