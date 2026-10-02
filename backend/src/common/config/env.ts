import { Expose, plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
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

const SSE_MODES = ['AES256', 'aws:kms'] as const;

// Upload originals (ADR-0006, T07). Endpoint is set for MinIO / non-AWS S3 only;
// credentials may be absent when the runtime provides them (instance role).
export class StorageEnv extends DatabaseEnv {
  @Expose()
  @IsOptional()
  @IsUrl({ require_tld: false, protocols: ['http', 'https'] })
  S3_ENDPOINT?: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  S3_REGION: string = 'eu-central-1';

  @Expose()
  @IsString()
  @IsNotEmpty()
  S3_BUCKET: string;

  @Expose()
  @IsOptional()
  @IsString()
  S3_ACCESS_KEY_ID?: string;

  @Expose()
  @IsOptional()
  @IsString()
  S3_SECRET_ACCESS_KEY?: string;

  // MinIO needs path-style URLs. Implicit conversion would turn 'false' into true.
  @Expose()
  @Transform(({ obj }: { obj: Record<string, unknown> }) =>
    [true, 'true', '1'].includes(obj.S3_FORCE_PATH_STYLE as string | boolean),
  )
  @IsBoolean()
  S3_FORCE_PATH_STYLE: boolean = false;

  // Unset in dev: MinIO without a KMS rejects SSE headers. Set in the managed bucket.
  @Expose()
  @IsOptional()
  @IsIn(SSE_MODES)
  S3_SERVER_SIDE_ENCRYPTION?: (typeof SSE_MODES)[number];
}

export class Env extends StorageEnv {
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
