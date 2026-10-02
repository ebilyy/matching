import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import type { Page } from '../../../common/pagination/page';
import {
  ShopContextGuard,
  ShopId,
} from '../../../common/request-context/shop-context.guard';
import { uuidPipe } from '../../../common/validation/validation.pipe';
import type { ImportResponse } from '../dto/import.dto';
import { ListImportsQueryDto } from '../dto/import.dto';
import { ImportsService } from '../services/imports.service';

// Tenant API (ADR-0008). Uploads themselves live in catalog / price-import.
@Controller('imports')
@UseGuards(ShopContextGuard)
export class ImportsController {
  constructor(private readonly imports: ImportsService) {}

  @Get()
  list(
    @ShopId() shopId: string,
    @Query() query: ListImportsQueryDto,
  ): Promise<Page<ImportResponse>> {
    return this.imports.list(shopId, query);
  }

  @Get(':import_id')
  get(
    @ShopId() shopId: string,
    @Param('import_id', uuidPipe('import_id')) id: string,
  ): Promise<ImportResponse> {
    return this.imports.get(shopId, id);
  }
}
