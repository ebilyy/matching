import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

// Contract is the source of truth (Common DoD: every endpoint's responses are
// validated against openapi.yaml).
export const OPENAPI_PATH = resolve(
  __dirname,
  '../../../docs/features/product-matching/contracts/openapi.yaml',
);

type Response = { $ref?: string; content?: Record<string, unknown> };
type Operation = {
  operationId?: string;
  responses?: Record<string, Response>;
};
type OpenApiDoc = {
  paths: Record<string, Record<string, Operation>>;
  components?: { responses?: Record<string, Response> };
};

const doc = parse(readFileSync(OPENAPI_PATH, 'utf8')) as OpenApiDoc;
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addSchema(doc, 'openapi');

function locate(operationId: string, status: number) {
  for (const [path, item] of Object.entries(doc.paths)) {
    for (const [method, op] of Object.entries(item)) {
      if (op.operationId !== operationId) continue;
      let response = op.responses?.[String(status)];
      if (!response) {
        throw new Error(`${operationId}: no ${status} response in openapi`);
      }
      // Shared responses: `{ $ref: '#/components/responses/<Name>' }`.
      let base = ['paths', path, method, 'responses', String(status)];
      if (response.$ref) {
        const name = response.$ref.replace('#/components/responses/', '');
        response = doc.components?.responses?.[name] ?? {};
        base = ['components', 'responses', name];
      }
      const types = Object.keys(response.content ?? {});
      if (types.length !== 1) {
        throw new Error(`${operationId} ${status}: expected one content type`);
      }
      const pointer = base
        .concat(['content', types[0], 'schema'])
        .map((s) => s.replace(/~/g, '~0').replace(/\//g, '~1'))
        .join('/');
      return { contentType: types[0], ref: `openapi#/${pointer}` };
    }
  }
  throw new Error(`operationId ${operationId} not found in openapi`);
}

export function expectResponseToMatch(
  operationId: string,
  res: { status: number; headers: Record<string, string>; body: unknown },
): void {
  const { contentType, ref } = locate(operationId, res.status);
  expect(res.headers['content-type']).toContain(contentType);
  const validate = ajv.getSchema(ref);
  if (!validate) throw new Error(`cannot compile ${ref}`);
  if (!validate(res.body)) {
    throw new Error(
      `${operationId} ${res.status} body does not match openapi:\n` +
        ajv.errorsText(validate.errors, { separator: '\n' }),
    );
  }
}
