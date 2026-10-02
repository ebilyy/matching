import { v7 as uuidv7 } from 'uuid';

// UUID v7 generated app-side (rules/migrations.md → Defaults): time-ordered, so
// new rows land at the right edge of the PK index.
export function newId(): string {
  return uuidv7();
}
