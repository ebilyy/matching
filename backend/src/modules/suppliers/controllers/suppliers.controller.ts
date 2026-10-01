import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type Page, mapPage } from '../../../common/pagination/page';
import { PageQueryDto } from '../../../common/pagination/page-query.dto';
import {
  ShopContextGuard,
  ShopId,
} from '../../../common/request-context/shop-context.guard';
import { uuidPipe } from '../../../common/validation/validation.pipe';
import {
  CreateSupplierDto,
  type SupplierResponse,
  toSupplierResponse,
  UpdateSupplierDto,
} from '../dto/supplier.dto';
import { SuppliersService } from '../services/suppliers.service';

// Tenant API (ADR-0008): shop_id comes from the credential, never from the path or body.
@Controller('suppliers')
@UseGuards(ShopContextGuard)
export class SuppliersController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Get()
  async list(
    @ShopId() shopId: string,
    @Query() query: PageQueryDto,
  ): Promise<Page<SupplierResponse>> {
    const now = new Date();
    return mapPage(await this.suppliers.list(shopId, query), (s) =>
      toSupplierResponse(s, now),
    );
  }

  @Post()
  async create(
    @ShopId() shopId: string,
    @Body() dto: CreateSupplierDto,
  ): Promise<SupplierResponse> {
    return toSupplierResponse(await this.suppliers.create(shopId, dto));
  }

  @Get(':supplier_id')
  async get(
    @ShopId() shopId: string,
    @Param('supplier_id', uuidPipe('supplier_id')) id: string,
  ): Promise<SupplierResponse> {
    return toSupplierResponse(await this.suppliers.getOrFail(shopId, id));
  }

  @Patch(':supplier_id')
  async update(
    @ShopId() shopId: string,
    @Param('supplier_id', uuidPipe('supplier_id')) id: string,
    @Body() dto: UpdateSupplierDto,
  ): Promise<SupplierResponse> {
    return toSupplierResponse(await this.suppliers.update(shopId, id, dto));
  }
}
