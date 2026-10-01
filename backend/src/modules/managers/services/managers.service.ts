import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { AppError } from '../../../common/errors/app-error';
import { type Page, paginateById } from '../../../common/pagination/page';
import type { PageQueryDto } from '../../../common/pagination/page-query.dto';
import { ShopsService } from '../../shops/services/shops.service';
import type { CreateManagerDto, UpdateManagerDto } from '../dto/manager.dto';
import { ManagerEntity } from '../entities/manager.entity';

const managerNotFound = () =>
  new AppError('manager.not_found', 404, 'Менеджера не знайдено.');

// Every lookup is scoped by shop_id: a manager of another shop is not found (AC-12).
@Injectable()
export class ManagersService {
  constructor(
    @InjectRepository(ManagerEntity)
    private readonly managers: Repository<ManagerEntity>,
    private readonly shops: ShopsService,
  ) {}

  async list(
    shopId: string,
    query: PageQueryDto,
  ): Promise<Page<ManagerEntity>> {
    await this.shops.getOrFail(shopId);
    const qb = this.managers
      .createQueryBuilder('manager')
      .where('manager.shop_id = :shopId', { shopId });
    return paginateById(qb, query);
  }

  async getOrFail(shopId: string, id: string): Promise<ManagerEntity> {
    await this.shops.getOrFail(shopId);
    const manager = await this.managers.findOneBy({ shopId, id });
    if (!manager) throw managerNotFound();
    return manager;
  }

  async create(shopId: string, dto: CreateManagerDto): Promise<ManagerEntity> {
    await this.shops.getOrFail(shopId);
    return this.managers.save(
      this.managers.create({ shopId, displayName: dto.display_name }),
    );
  }

  async update(
    shopId: string,
    id: string,
    dto: UpdateManagerDto,
  ): Promise<ManagerEntity> {
    const manager = await this.getOrFail(shopId, id);
    if (dto.display_name !== undefined) manager.displayName = dto.display_name;
    return this.managers.save(manager);
  }
}
