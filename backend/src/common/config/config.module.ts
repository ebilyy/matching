import { ConfigModule } from '@nestjs/config';
import { parseEnv } from './env';

// ConfigModule.forRoot snapshots process.env when called, so call it at
// bootstrap (from ApiModule/WorkerModule.forRoot), never in a static @Module.
export function appConfigModule() {
  return ConfigModule.forRoot({
    isGlobal: true,
    cache: true,
    ignoreEnvFile: true,
    validate: parseEnv,
  });
}
