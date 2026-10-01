import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { MigrationInterface, QueryRunner } from 'typeorm';

// backend/migrations/ — the reviewed source of truth (rules/migrations.md).
// Same relative depth from src/ (ts-node, jest) and dist/ (production image).
export const SQL_MIGRATIONS_DIR = resolve(__dirname, '../../../migrations');

export function readSqlMigration(file: string): string {
  return readFileSync(resolve(SQL_MIGRATIONS_DIR, file), 'utf8');
}

// Thin wrapper over one <timestamp>_<verb>_<entity>.{up,down}.sql pair.
// Never put schema changes here: add a new SQL pair instead.
export abstract class SqlFileMigration implements MigrationInterface {
  protected abstract readonly pair: string;

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(readSqlMigration(`${this.pair}.up.sql`));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(readSqlMigration(`${this.pair}.down.sql`));
  }
}
