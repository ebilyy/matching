import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import type { Env } from '../config/env';
import { REDACT_CENSOR, REDACT_PATHS } from './redact';
import { resolveRequestId } from './request-id';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const role = config.get('APP_ROLE', { infer: true });
        return {
          pinoHttp: {
            level: config.get('LOG_LEVEL', { infer: true }),
            // Every line says which process wrote it (api | worker).
            mixin: () => ({ role }),
            redact: { paths: REDACT_PATHS, censor: REDACT_CENSOR },
            genReqId: resolveRequestId,
            // Bound to every log line written while handling the request.
            customProps: (req) => ({ request_id: req.id }),
            // The compose healthcheck polls /health; keep it out of the log.
            autoLogging: { ignore: (req) => req.url === '/health' },
            transport:
              config.get('LOG_FORMAT', { infer: true }) === 'pretty'
                ? { target: 'pino-pretty', options: { singleLine: true } }
                : undefined,
          },
        };
      },
    }),
  ],
})
export class LoggingModule {}
