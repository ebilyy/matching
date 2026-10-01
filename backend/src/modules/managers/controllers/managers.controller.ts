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
  CreateManagerDto,
  type ManagerResponse,
  toManagerResponse,
  UpdateManagerDto,
} from '../dto/manager.dto';
import { ManagersService } from '../services/managers.service';

// Operator API (openapi tag `operator`): managers are nested under their shop.
// TODO(roles): restrict to the operator role once the role guard exists.
@Controller('shops/:shop_id/managers')
export class ManagersController {
  constructor(private readonly managers: ManagersService) {}

  @Get()
  async list(
    @Param('shop_id', uuidPipe('shop_id')) shopId: string,
    @Query() query: PageQueryDto,
  ): Promise<Page<ManagerResponse>> {
    return mapPage(await this.managers.list(shopId, query), toManagerResponse);
  }

  @Post()
  async create(
    @Param('shop_id', uuidPipe('shop_id')) shopId: string,
    @Body() dto: CreateManagerDto,
  ): Promise<ManagerResponse> {
    return toManagerResponse(await this.managers.create(shopId, dto));
  }

  @Get(':manager_id')
  async get(
    @Param('shop_id', uuidPipe('shop_id')) shopId: string,
    @Param('manager_id', uuidPipe('manager_id')) id: string,
  ): Promise<ManagerResponse> {
    return toManagerResponse(await this.managers.getOrFail(shopId, id));
  }

  @Patch(':manager_id')
  async update(
    @Param('shop_id', uuidPipe('shop_id')) shopId: string,
    @Param('manager_id', uuidPipe('manager_id')) id: string,
    @Body() dto: UpdateManagerDto,
  ): Promise<ManagerResponse> {
    return toManagerResponse(await this.managers.update(shopId, id, dto));
  }
}
