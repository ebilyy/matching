import { Module } from '@nestjs/common';
import {
  CatalogModule,
  FileIntakeModule,
  MatchingModule,
  MatchLedgerModule,
  OffersModule,
  PriceImportModule,
  ReviewModule,
  SuppliersModule,
} from './modules';

// The eight ADR-0007 modules. Both roles load all of them; a module decides
// what to register per role (controllers in api, job handlers in worker).
@Module({
  imports: [
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
