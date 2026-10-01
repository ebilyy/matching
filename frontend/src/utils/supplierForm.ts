import type { components } from '@/api/schema'

type Supplier = components['schemas']['Supplier']
type SupplierCreate = components['schemas']['SupplierCreate']
type SupplierUpdate = components['schemas']['SupplierUpdate']

/** Text inputs hold strings; the API speaks `null` for an empty optional field. */
export interface SupplierForm {
  name: string
  email: string
  phone: string
  website: string
  feed_url: string
  description: string
}

export type SupplierField = keyof SupplierForm

const optionalFields = ['email', 'phone', 'website', 'feed_url', 'description'] as const

export const supplierFields = ['name', ...optionalFields] as const

export function emptySupplierForm(): SupplierForm {
  return { name: '', email: '', phone: '', website: '', feed_url: '', description: '' }
}

export function supplierToForm(supplier: Supplier): SupplierForm {
  return {
    name: supplier.name,
    email: supplier.email ?? '',
    phone: supplier.phone ?? '',
    website: supplier.website ?? '',
    feed_url: supplier.feed_url ?? '',
    description: supplier.description ?? '',
  }
}

function orNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toCreatePayload(form: SupplierForm): SupplierCreate {
  const payload: SupplierCreate = { name: form.name.trim() }
  for (const field of optionalFields) payload[field] = orNull(form[field])
  return payload
}

/** Merge patch with only the fields that differ from the stored supplier (contract: absent = unchanged). */
export function toUpdatePayload(form: SupplierForm, supplier: Supplier): SupplierUpdate {
  const patch: SupplierUpdate = {}
  const name = form.name.trim()
  if (name !== supplier.name) patch.name = name
  for (const field of optionalFields) {
    const value = orNull(form[field])
    if (value !== supplier[field]) patch[field] = value
  }
  return patch
}

// Limits mirror openapi.yaml (SupplierCreate / SupplierUpdate), which mirror the suppliers columns.
type Rule = (value: string) => true | string

const maxLength =
  (limit: number): Rule =>
  (value) =>
    value.trim().length <= limit || `Не більше ${limit} символів`

const httpUrl: Rule = (value) =>
  value.trim() === '' ||
  /^https?:\/\/\S+$/.test(value.trim()) ||
  'Адреса має починатися з http:// або https://'

const email: Rule = (value) =>
  value.trim() === '' ||
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ||
  'Некоректна адреса пошти'

export const supplierRules: Record<SupplierField, Rule[]> = {
  name: [(value) => value.trim() !== '' || 'Вкажіть назву', maxLength(200)],
  email: [email, maxLength(254)],
  phone: [maxLength(32)],
  website: [httpUrl],
  feed_url: [httpUrl],
  description: [],
}
