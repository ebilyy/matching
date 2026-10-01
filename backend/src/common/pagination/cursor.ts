import { validationFailed } from '../errors/app-error';

// Opaque cursor (api-sync-report D-3): base64url of the keyset. Lists keyed by
// UUID v7 encode just the id, which is time-ordered.
export function encodeIdCursor(id: string): string {
  return Buffer.from(JSON.stringify({ id }), 'utf8').toString('base64url');
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function decodeIdCursor(cursor: string, field: string): string {
  try {
    const { id } = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as { id?: unknown };
    if (typeof id === 'string' && UUID.test(id)) return id;
  } catch {
    // fall through
  }
  throw validationFailed([{ field, problem: 'is not a valid cursor' }]);
}
