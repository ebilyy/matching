import { plainToInstance, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { AppError, validationFailed } from '../../../common/errors/app-error';
import { flatten } from '../../../common/validation/validation.pipe';
import type { ColumnMapping } from '../../suppliers/entities/suppliers.entity';
import { ImportKind } from '../import.enums';

// openapi ColumnRole.
export const COLUMN_ROLES = [
  'sku',
  'name',
  'barcode',
  'manufacturer_code',
  'brand',
  'category',
  'supplier_code',
  'price',
  'in_stock',
  'stock_quantity',
] as const;
export type ColumnRole = (typeof COLUMN_ROLES)[number];

const ROLES_BY_KIND: Record<
  ImportKind,
  { allowed: readonly ColumnRole[]; required: readonly ColumnRole[] }
> = {
  [ImportKind.Catalog]: {
    allowed: [
      'sku',
      'name',
      'barcode',
      'manufacturer_code',
      'brand',
      'category',
    ],
    required: ['sku', 'name'],
  },
  [ImportKind.Price]: {
    allowed: [
      'supplier_code',
      'name',
      'barcode',
      'manufacturer_code',
      'brand',
      'price',
      'in_stock',
      'stock_quantity',
    ],
    required: ['name', 'price'],
  },
};

// openapi ColumnMappingEntry: `role` must be present; null = column ignored.
class ColumnMappingEntryDto {
  @IsString()
  @MaxLength(200)
  header: string;

  @ValidateIf((entry: ColumnMappingEntryDto) => entry.role !== null)
  @IsIn(COLUMN_ROLES)
  role: ColumnRole | null;
}

// openapi ColumnMapping.
export class ColumnMappingDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ColumnMappingEntryDto)
  columns: ColumnMappingEntryDto[];
}

// `column_mapping` travels as a JSON text part of multipart/form-data.
export function parseColumnMapping(
  raw: string,
  kind: ImportKind,
): ColumnMapping {
  const field = 'column_mapping';
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw validationFailed([{ field, problem: 'must be valid JSON' }]);
  }
  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    throw validationFailed([{ field, problem: 'must be an object' }]);
  }
  const dto = plainToInstance(ColumnMappingDto, json);
  const errors = validateSync(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length > 0) throw validationFailed(flatten(errors, field));

  const { allowed, required } = ROLES_BY_KIND[kind];
  const foreign = dto.columns.flatMap((c, i) =>
    c.role !== null && !allowed.includes(c.role)
      ? [
          {
            field: `${field}.columns.${i}.role`,
            problem: `is not a ${kind} role`,
          },
        ]
      : [],
  );
  if (foreign.length > 0) throw validationFailed(foreign);

  const roles = dto.columns.flatMap((c) => (c.role ? [c.role] : []));
  const missing_roles = required.filter((r) => !roles.includes(r));
  const duplicate_roles = [
    ...new Set(roles.filter((r, i) => roles.indexOf(r) !== i)),
  ];
  if (missing_roles.length > 0 || duplicate_roles.length > 0) {
    throw invalidColumnMapping(missing_roles, duplicate_roles);
  }
  return {
    columns: dto.columns.map(({ header, role }) => ({ header, role })),
  };
}

function invalidColumnMapping(
  missing_roles: ColumnRole[],
  duplicate_roles: ColumnRole[],
): AppError {
  const details: Record<string, unknown> = {};
  if (missing_roles.length > 0) details.missing_roles = missing_roles;
  if (duplicate_roles.length > 0) details.duplicate_roles = duplicate_roles;
  const message =
    missing_roles.length > 0
      ? `Не вказано обов’язкові колонки: ${missing_roles.join(', ')}.`
      : `Одна роль призначена кільком колонкам: ${duplicate_roles.join(', ')}.`;
  return new AppError('import.invalid_column_mapping', 422, message, details);
}
