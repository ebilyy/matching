import { DynamicModule, Module } from '@nestjs/common';
import { appConfigModule } from './common/config/config.module';
import { LoggingModule } from './common/logging/logging.module';
import { DomainModule } from './domain.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { HealthModule } from './health/health.module';

@Module({})
export class ApiModule {
  static forRoot(): DynamicModule {
    return {
      module: ApiModule,
      imports: [
        appConfigModule(),
        LoggingModule,
        DatabaseModule,
        StorageModule,
        DomainModule,
        HealthModule,
      ],
    };
  }
}
