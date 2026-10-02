import { AppError } from '../../../common/errors/app-error';
import { ImportKind } from '../import.enums';
import { parseColumnMapping } from './column-mapping.dto';

const catalog = (columns: unknown) =>
  parseColumnMapping(JSON.stringify({ columns }), ImportKind.Catalog);

function errorOf(fn: () => unknown): AppError {
  try {
    fn();
  } catch (error) {
    if (error instanceof AppError) return error;
    throw error;
  }
  throw new Error('expected an AppError');
}

describe('parseColumnMapping', () => {
  it('returns the mapping, null roles included', () => {
    expect(
      catalog([
        { header: 'Артикул', role: 'sku' },
        { header: 'Назва', role: 'name' },
        { header: 'Примітка', role: null },
      ]),
    ).toEqual({
      columns: [
        { header: 'Артикул', role: 'sku' },
        { header: 'Назва', role: 'name' },
        { header: 'Примітка', role: null },
      ],
    });
  });

  it('rejects text that is not JSON', () => {
    const error = errorOf(() =>
      parseColumnMapping('{columns', ImportKind.Catalog),
    );
    expect(error).toMatchObject({
      code: 'common.validation_failed',
      status: 422,
    });
  });

  it('rejects an entry without a role', () => {
    const error = errorOf(() => catalog([{ header: 'Артикул' }]));
    expect(error.details).toEqual({
      fields: [
        expect.objectContaining({ field: 'column_mapping.columns.0.role' }),
      ],
    });
  });

  it('rejects a price role in a catalog mapping', () => {
    const error = errorOf(() =>
      catalog([
        { header: 'Артикул', role: 'sku' },
        { header: 'Назва', role: 'name' },
        { header: 'Ціна', role: 'price' },
      ]),
    );
    expect(error.code).toBe('common.validation_failed');
  });

  it('reports missing and duplicate roles as invalid_column_mapping', () => {
    const error = errorOf(() =>
      catalog([
        { header: 'Назва', role: 'name' },
        { header: 'Назва 2', role: 'name' },
      ]),
    );
    expect(error).toMatchObject({
      code: 'import.invalid_column_mapping',
      status: 422,
      details: { missing_roles: ['sku'], duplicate_roles: ['name'] },
    });
  });

  it('requires name and price for a price file', () => {
    const error = errorOf(() =>
      parseColumnMapping(
        JSON.stringify({ columns: [{ header: 'Назва', role: 'name' }] }),
        ImportKind.Price,
      ),
    );
    expect(error.details).toEqual({ missing_roles: ['price'] });
  });
});
