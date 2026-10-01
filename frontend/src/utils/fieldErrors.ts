import type { components } from '@/api/schema'

type FieldViolation = components['schemas']['FieldViolation']

/**
 * Spreads a 422 `details.fields` list (ValidationDetails) over the given form inputs.
 * Other errors carry other `details`; they and unknown fields are left to the toast.
 */
export function fieldErrors<F extends string>(
  details: unknown,
  fields: readonly F[],
): Partial<Record<F, string>> {
  const errors: Partial<Record<F, string>> = {}
  const violations =
    typeof details === 'object' &&
    details !== null &&
    'fields' in details &&
    Array.isArray(details.fields)
      ? (details.fields as FieldViolation[])
      : []
  for (const { field, problem } of violations) {
    if ((fields as readonly string[]).includes(field)) errors[field as F] = problem
  }
  return errors
}
