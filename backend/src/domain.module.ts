import { Module } from '@nestjs/common';
import {
  CatalogModule,
  FileIntakeModule,
  ManagersModule,
  MatchingModule,
  MatchLedgerModule,
  OffersModule,
  PriceImportModule,
  ReviewModule,
  ShopsModule,
  SuppliersModule,
} from './modules';

// The eight ADR-0007 modules plus shops (tenant) and managers (actor). Both roles
// load all of them; a module decides what to register per role (controllers in
// api, job handlers in worker).
@Module({
  imports: [
    ShopsModule,
    ManagersModule,
    CatalogModule,
    SuppliersModule,
    FileIntakeModule,
    PriceImportModule,
    MatchingModule,
    MatchLedgerModule,
    ReviewModule,
    OffersModule,
  ],
})
export class DomainModule {}
