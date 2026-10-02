import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { validationFailed } from '../errors/app-error';
import { decodeIdCursor, encodeIdCursor } from './cursor';
import type { PageQueryDto } from './page-query.dto';

export type Page<T> = {
  items: T[];
  has_next: boolean;
  has_prev: boolean;
  next_cursor: string | null;
  prev_cursor: string | null;
};

// Keyset pagination by UUID v7 id: `ASC` = oldest first, `DESC` = newest first.
// `qb` carries the list's own filters; this adds the cursor condition, order and limit.
export async function paginateById<E extends ObjectLiteral & { id: string }>(
  qb: SelectQueryBuilder<E>,
  query: PageQueryDto,
  order: 'ASC' | 'DESC' = 'ASC',
): Promise<Page<E>> {
  if (query.after && query.before) {
    throw validationFailed([
      { field: 'before', problem: 'is mutually exclusive with after' },
    ]);
  }
  const alias = qb.alias;
  const backwards = Boolean(query.before);
  const reverse = order === 'ASC' ? 'DESC' : 'ASC';
  const ahead = order === 'ASC' ? '>' : '<';
  const behind = order === 'ASC' ? '<' : '>';

  if (query.after) {
    qb.andWhere(`${alias}.id ${ahead} :cursor`, {
      cursor: decodeIdCursor(query.after, 'after'),
    });
  } else if (query.before) {
    qb.andWhere(`${alias}.id ${behind} :cursor`, {
      cursor: decodeIdCursor(query.before, 'before'),
    });
  }
  const rows = await qb
    .orderBy(`${alias}.id`, backwards ? reverse : order)
    .take(query.limit + 1)
    .getMany();

  const more = rows.length > query.limit;
  const items = rows.slice(0, query.limit);
  if (backwards) items.reverse();

  const has_next = backwards ? true : more;
  const has_prev = backwards ? more : Boolean(query.after);
  return {
    items,
    has_next,
    has_prev,
    next_cursor:
      has_next && items.length
        ? encodeIdCursor(items[items.length - 1].id)
        : null,
    prev_cursor: has_prev && items.length ? encodeIdCursor(items[0].id) : null,
  };
}

export function mapPage<E, T>(page: Page<E>, map: (e: E) => T): Page<T> {
  return { ...page, items: page.items.map(map) };
}
