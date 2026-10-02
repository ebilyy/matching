import type { ColumnMapping } from '../../suppliers/entities/suppliers.entity';
import type { ImportEntity, ImportIssues } from '../entities/import.entity';
import type { ImportKind, ImportSource, ImportStatus } from '../import.enums';
import { IsOptional, IsUUID } from 'class-validator';
import { PageQueryDto } from '../../../common/pagination/page-query.dto';

// openapi listImports query.
export class ListImportsQueryDto extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  supplier_id?: string;
}

// openapi Actor. `system` = no manager (scheduled feed, automatic matching).
export type ActorResponse = {
  kind: 'system' | 'manager';
  manager_id: string | null;
  display_name: string | null;
};

// openapi Import
export type ImportResponse = {
  id: string;
  kind: ImportKind;
  source: ImportSource;
  status: ImportStatus;
  supplier_id: string | null;
  uploaded_by: ActorResponse;
  original_filename: string | null;
  column_mapping: ColumnMapping | null;
  issues: ImportIssues | null;
  rows_recognized: number | null;
  auto_matched_count: number | null;
  proposals_count: number | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export function toImportResponse(
  row: ImportEntity,
  managerName: string | null = null,
): ImportResponse {
  return {
    id: row.id,
    kind: row.kind,
    source: row.source,
    status: row.status,
    supplier_id: row.supplierId,
    uploaded_by: row.managerId
      ? {
          kind: 'manager',
          manager_id: row.managerId,
          display_name: managerName,
        }
      : { kind: 'system', manager_id: null, display_name: null },
    original_filename: row.originalFilename,
    column_mapping: row.columnMapping,
    issues: row.issues,
    rows_recognized: row.rowsRecognized,
    auto_matched_count: row.autoMatchedCount,
    proposals_count: row.proposalsCount,
    created_at: row.createdAt.toISOString(),
    started_at: row.startedAt?.toISOString() ?? null,
    finished_at: row.finishedAt?.toISOString() ?? null,
  };
}
