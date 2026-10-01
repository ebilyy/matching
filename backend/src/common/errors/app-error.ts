// A typed error the problem+json filter renders as-is (SAD §8, rules/openapi.md).
// `code` must be one of the Error.code enum values in openapi.yaml.
export class AppError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export type FieldViolation = { field: string; problem: string };

export function validationFailed(fields: FieldViolation[]): AppError {
  return new AppError(
    'common.validation_failed',
    422,
    'Запит містить некоректні поля.',
    { fields },
  );
}
