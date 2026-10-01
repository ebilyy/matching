import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveRequestId } from './request-id';

function call(header?: string) {
  const req = {
    headers: header === undefined ? {} : { 'x-request-id': header },
  } as IncomingMessage;
  const setHeader = jest.fn();
  const id = resolveRequestId(req, { setHeader } as unknown as ServerResponse);
  return { id, setHeader };
}

describe('resolveRequestId', () => {
  it('reuses a valid incoming id and echoes it', () => {
    const { id, setHeader } = call('abc-123');
    expect(id).toBe('abc-123');
    expect(setHeader).toHaveBeenCalledWith('x-request-id', 'abc-123');
  });

  it.each([undefined, '', 'has space', 'x'.repeat(129)])(
    'mints a uuid for %p',
    (header) => {
      expect(call(header).id).toMatch(/^[0-9a-f-]{36}$/);
    },
  );
});
