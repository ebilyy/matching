import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { type Page, mapPage } from '../../../common/pagination/page';
import { PageQueryDto } from '../../../common/pagination/page-query.dto';
import { uuidPipe } from '../../../common/validation/validation.pipe';
import {
  CreateShopDto,
  type ShopResponse,
  toShopResponse,
  UpdateShopDto,
} from '../dto/shop.dto';
import { ShopsService } from '../services/shops.service';

// Operator API (openapi tag `operator`): works across shops, so shop_id is in the path.
// TODO(roles): restrict to the operator role once the role guard exists.
@Controller('shops')
export class ShopsController {
  constructor(private readonly shops: ShopsService) {}

  @Get()
  async list(@Query() query: PageQueryDto): Promise<Page<ShopResponse>> {
    return mapPage(await this.shops.list(query), toShopResponse);
  }

  @Post()
  async create(@Body() dto: CreateShopDto): Promise<ShopResponse> {
    return toShopResponse(await this.shops.create(dto));
  }

  @Get(':shop_id')
  async get(
    @Param('shop_id', uuidPipe('shop_id')) id: string,
  ): Promise<ShopResponse> {
    return toShopResponse(await this.shops.getOrFail(id));
  }

  @Patch(':shop_id')
  async update(
    @Param('shop_id', uuidPipe('shop_id')) id: string,
    @Body() dto: UpdateShopDto,
  ): Promise<ShopResponse> {
    return toShopResponse(await this.shops.update(id, dto));
  }
}
