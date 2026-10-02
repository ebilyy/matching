import type { Readable } from 'node:stream';

export type PutObject = {
  key: string;
  body: Readable;
  contentType?: string;
};

// Uploaded originals (ADR-0006). Bodies are streams end to end: a 50 MB file is
// never held in memory whole (T07 DoD).
export abstract class StoragePort {
  abstract putStream(object: PutObject): Promise<void>;
  abstract getStream(key: string): Promise<Readable>;
  abstract delete(key: string): Promise<void>;
}

// `<shop_id>/<import_id>/<filename>`: one prefix per shop, so a lifecycle or an
// export can work per tenant. The filename is reduced to a safe last segment.
export function importObjectKey(
  shopId: string,
  importId: string,
  filename: string,
): string {
  const base = filename.split(/[\\/]/).pop() ?? '';
  // Control characters are dropped: S3 accepts them, but logs and headers do not.
  const printable = [...base]
    .filter((c) => c.charCodeAt(0) > 0x1f && c.charCodeAt(0) !== 0x7f)
    .join('');
  const safe = printable.trim() || 'upload';
  return `${shopId}/${importId}/${safe}`;
}
