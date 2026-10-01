import {
  ParseUUIDPipe,
  ValidationPipe,
  type ValidationError,
} from '@nestjs/common';
import { type FieldViolation, validationFailed } from '../errors/app-error';

function flatten(errors: ValidationError[], prefix = ''): FieldViolation[] {
  return errors.flatMap((e) => {
    const field = prefix ? `${prefix}.${e.property}` : e.property;
    const own = Object.values(e.constraints ?? {}).map((problem) => ({
      field,
      problem,
    }));
    return own.concat(flatten(e.children ?? [], field));
  });
}

// Validation → 422 common.validation_failed (rules/openapi.md), not the Nest default 400.
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => validationFailed(flatten(errors)),
  });
}

export function uuidPipe(field: string): ParseUUIDPipe {
  return new ParseUUIDPipe({
    exceptionFactory: () =>
      validationFailed([{ field, problem: 'must be a UUID' }]),
  });
}
