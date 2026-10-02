import { randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';
import { setFlagsFromString } from 'node:v8';
import { runInNewContext } from 'node:vm';
import { parseEnv } from '../src/common/config/env';
import { newId } from '../src/common/ids/new-id';
import { S3StorageAdapter } from '../src/infrastructure/storage/s3-storage.adapter';

// T07 DoD: the S3 adapter against the compose MinIO.
const env = parseEnv({ ...process.env, APP_ROLE: 'worker' });
const MB = 1024 * 1024;

// A forced gc lets the samples below see live memory, not uncollected garbage.
setFlagsFromString('--expose-gc');
const gc = runInNewContext('gc') as () => void;
const liveBytes = () => {
  gc();
  const { heapUsed, arrayBuffers } = process.memoryUsage();
  return heapUsed + arrayBuffers;
};

async function readAll(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

// `total` bytes produced lazily in 1 MB chunks, never held together.
function lazyStream(total: number): Readable {
  let sent = 0;
  return new Readable({
    read() {
      if (sent >= total) return this.push(null);
      const size = Math.min(MB, total - sent);
      sent += size;
      this.push(Buffer.alloc(size, sent % 251));
    },
  });
}

describe('S3StorageAdapter', () => {
  const storage = new S3StorageAdapter(env);
  const prefix = `storage-int-test/${newId()}`;

  afterAll(() => storage.onModuleDestroy());

  it('returns the bytes it stored and deletes them', async () => {
    const key = `${prefix}/small.csv`;
    const bytes = randomBytes(64 * 1024);

    await storage.putStream({
      key,
      body: Readable.from([bytes]),
      contentType: 'text/csv',
    });
    expect((await readAll(await storage.getStream(key))).equals(bytes)).toBe(
      true,
    );

    await storage.delete(key);
    await expect(storage.getStream(key)).rejects.toMatchObject({
      name: 'NoSuchKey',
    });
  });

  it('streams a 50 MB object without buffering it whole', async () => {
    const key = `${prefix}/big.xlsx`;
    const total = 50 * MB;
    const before = liveBytes();
    let peak = before;
    const sampler = setInterval(() => {
      peak = Math.max(peak, liveBytes());
    }, 20);

    try {
      await storage.putStream({ key, body: lazyStream(total) });
    } finally {
      clearInterval(sampler);
    }

    // queueSize 2 × 5 MB parts plus SDK overhead; a full buffer would be ≥ 50 MB.
    expect(peak - before).toBeLessThan(25 * MB);

    let received = 0;
    for await (const chunk of await storage.getStream(key)) {
      received += (chunk as Buffer).length;
    }
    expect(received).toBe(total);
    await storage.delete(key);
  }, 60_000);
});
