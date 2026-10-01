import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { AppError, validationFailed } from '../../../common/errors/app-error';
import { type Page, paginateById } from '../../../common/pagination/page';
import type { PageQueryDto } from '../../../common/pagination/page-query.dto';
import {
  type CreateSupplierDto,
  SUPPLIER_CARD_FIELDS,
  type UpdateSupplierDto,
} from '../dto/supplier.dto';
import { SupplierEntity } from '../entities/suppliers.entity';

export const supplierNotFound = () =>
  new AppError('supplier.not_found', 404, 'Постачальника не знайдено.');

// Every query is scoped by the caller's shop_id: another shop's supplier is not found (AC-12).
@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly suppliers: Repository<SupplierEntity>,
  ) {}

  list(shopId: string, query: PageQueryDto): Promise<Page<SupplierEntity>> {
    const qb = this.suppliers
      .createQueryBuilder('supplier')
      .where('supplier.shop_id = :shopId', { shopId });
    return paginateById(qb, query);
  }

  async getOrFail(shopId: string, id: string): Promise<SupplierEntity> {
    const supplier = await this.suppliers.findOneBy({ shopId, id });
    if (!supplier) throw supplierNotFound();
    return supplier;
  }

  create(shopId: string, dto: CreateSupplierDto): Promise<SupplierEntity> {
    return this.suppliers.save(
      this.suppliers.create({
        shopId,
        name: dto.name,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        website: dto.website ?? null,
        description: dto.description ?? null,
        feedUrl: dto.feed_url ?? null,
        columnMapping: null,
        priceDate: null,
      }),
    );
  }

  async update(
    shopId: string,
    id: string,
    dto: UpdateSupplierDto,
  ): Promise<SupplierEntity> {
    // openapi SupplierUpdate: minProperties 1.
    if (SUPPLIER_CARD_FIELDS.every((field) => dto[field] === undefined)) {
      throw validationFailed([
        { field: '', problem: 'must have at least one property' },
      ]);
    }
    const supplier = await this.getOrFail(shopId, id);
    if (dto.name !== undefined) supplier.name = dto.name;
    if (dto.email !== undefined) supplier.email = dto.email;
    if (dto.phone !== undefined) supplier.phone = dto.phone;
    if (dto.website !== undefined) supplier.website = dto.website;
    if (dto.description !== undefined) supplier.description = dto.description;
    if (dto.feed_url !== undefined) supplier.feedUrl = dto.feed_url;
    return this.suppliers.save(supplier);
  }
}
