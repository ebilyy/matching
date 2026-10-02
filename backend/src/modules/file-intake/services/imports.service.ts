import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, type Repository } from 'typeorm';
import { AppError } from '../../../common/errors/app-error';
import { type Page, paginateById } from '../../../common/pagination/page';
import { ManagerEntity } from '../../managers/entities/manager.entity';
import type { ImportResponse, ListImportsQueryDto } from '../dto/import.dto';
import { toImportResponse } from '../dto/import.dto';
import { ImportEntity } from '../entities/import.entity';

export const importNotFound = () =>
  new AppError('import.not_found', 404, 'Імпорт не знайдено.');

// Reads of imports, always scoped by the caller's shop_id (AC-12).
@Injectable()
export class ImportsService {
  constructor(
    @InjectRepository(ImportEntity)
    private readonly imports: Repository<ImportEntity>,
    @InjectRepository(ManagerEntity)
    private readonly managers: Repository<ManagerEntity>,
  ) {}

  async list(
    shopId: string,
    query: ListImportsQueryDto,
  ): Promise<Page<ImportResponse>> {
    const qb = this.imports
      .createQueryBuilder('import')
      .where('import.shop_id = :shopId', { shopId });
    if (query.supplier_id) {
      qb.andWhere('import.supplier_id = :supplierId', {
        supplierId: query.supplier_id,
      });
    }
    const page = await paginateById(qb, query, 'DESC');
    return { ...page, items: await this.withActors(shopId, page.items) };
  }

  async get(shopId: string, id: string): Promise<ImportResponse> {
    const row = await this.imports.findOneBy({ shopId, id });
    if (!row) throw importNotFound();
    const [response] = await this.withActors(shopId, [row]);
    return response;
  }

  // One query for the page's managers instead of a join per row.
  private async withActors(
    shopId: string,
    rows: ImportEntity[],
  ): Promise<ImportResponse[]> {
    const ids = [
      ...new Set(rows.flatMap((r) => (r.managerId ? [r.managerId] : []))),
    ];
    const names = new Map(
      ids.length === 0
        ? []
        : (await this.managers.findBy({ shopId, id: In(ids) })).map((m) => [
            m.id,
            m.displayName,
          ]),
    );
    return rows.map((r) =>
      toImportResponse(
        r,
        r.managerId ? (names.get(r.managerId) ?? null) : null,
      ),
    );
  }
}
