import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { AppError } from '../../../common/errors/app-error';
import { type Page, paginateById } from '../../../common/pagination/page';
import type { PageQueryDto } from '../../../common/pagination/page-query.dto';
import type { CreateShopDto, UpdateShopDto } from '../dto/shop.dto';
import { ShopEntity } from '../entities/shop.entity';

export const shopNotFound = () =>
  new AppError('shop.not_found', 404, 'Магазин не знайдено.');

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(ShopEntity)
    private readonly shops: Repository<ShopEntity>,
  ) {}

  list(query: PageQueryDto): Promise<Page<ShopEntity>> {
    return paginateById(this.shops.createQueryBuilder('shop'), query);
  }

  async getOrFail(id: string): Promise<ShopEntity> {
    const shop = await this.shops.findOneBy({ id });
    if (!shop) throw shopNotFound();
    return shop;
  }

  create(dto: CreateShopDto): Promise<ShopEntity> {
    return this.shops.save(this.shops.create({ name: dto.name }));
  }

  async update(id: string, dto: UpdateShopDto): Promise<ShopEntity> {
    const shop = await this.getOrFail(id);
    if (dto.name !== undefined) shop.name = dto.name;
    return this.shops.save(shop);
  }
}
