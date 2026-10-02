import { DynamicModule, Module } from '@nestjs/common';
import { appConfigModule } from './common/config/config.module';
import { LoggingModule } from './common/logging/logging.module';
import { DomainModule } from './domain.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { KeepAliveService } from './worker/keep-alive.service';

// ADR-0003: same image, no HTTP listener. pg-boss consumers arrive in T06.
@Module({})
export class WorkerModule {
  static forRoot(): DynamicModule {
    return {
      module: WorkerModule,
      imports: [
        appConfigModule(),
        LoggingModule,
        DatabaseModule,
        StorageModule,
        DomainModule,
      ],
      providers: [KeepAliveService],
    };
  }
}
