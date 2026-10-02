import { BeforeInsert, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { newId } from '../ids/new-id';

// Matches rules/migrations.md: UUID v7 PK generated app-side, created_at only,
// no soft delete (hard delete + audit table), updated_at is opt-in per entity.
export abstract class AbstractEntity {
  @PrimaryColumn('uuid', { name: 'id' })
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  readonly createdAt: Date;

  // Fires on repository.save() only; QueryBuilder inserts must set id themselves.
  @BeforeInsert()
  protected assignId(): void {
    this.id ??= newId();
  }
}
