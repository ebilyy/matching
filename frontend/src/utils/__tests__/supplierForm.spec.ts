import { describe, expect, it } from 'vitest'

import type { components } from '@/api/schema'
import {
  emptySupplierForm,
  supplierRules,
  supplierToForm,
  toCreatePayload,
  toUpdatePayload,
} from '../supplierForm'

const supplier: components['schemas']['Supplier'] = {
  id: '0199a3c1-5e6f-7b20-8c31-4d5e6f708192',
  name: 'Test Supplier',
  email: 'supplier@example.test',
  phone: '+380000000000',
  website: null,
  description: null,
  feed_url: null,
  column_mapping: null,
  price_date: null,
  is_price_stale: false,
  created_at: '2026-10-01T08:30:00Z',
}

describe('toCreatePayload', () => {
  it('trims values and sends empty optional fields as null', () => {
    const form = {
      ...emptySupplierForm(),
      name: '  Test Supplier ',
      email: ' supplier@example.test ',
    }

    expect(toCreatePayload(form)).toEqual({
      name: 'Test Supplier',
      email: 'supplier@example.test',
      phone: null,
      website: null,
      feed_url: null,
      description: null,
    })
  })
})

describe('toUpdatePayload', () => {
  it('is empty when nothing changed', () => {
    expect(toUpdatePayload(supplierToForm(supplier), supplier)).toEqual({})
  })

  it('sends only changed fields, clearing ones emptied by the user', () => {
    const form = {
      ...supplierToForm(supplier),
      phone: '',
      website: 'https://supplier.example.test',
    }

    expect(toUpdatePayload(form, supplier)).toEqual({
      phone: null,
      website: 'https://supplier.example.test',
    })
  })
})

describe('supplierRules', () => {
  const check = (field: keyof typeof supplierRules, value: string) =>
    supplierRules[field].map((rule) => rule(value)).find((result) => result !== true) ?? true

  it('requires a name within the column limit', () => {
    expect(check('name', '  ')).toBe('Вкажіть назву')
    expect(check('name', 'x'.repeat(201))).toBe('Не більше 200 символів')
    expect(check('name', 'Test Supplier')).toBe(true)
  })

  it('accepts only http(s) urls for the feed', () => {
    expect(check('feed_url', 'ftp://feeds.example.test/price.xlsx')).toMatch(/http/)
    expect(check('feed_url', 'https://feeds.example.test/price.xlsx')).toBe(true)
    expect(check('feed_url', '')).toBe(true)
  })

  it('checks the email shape only when one is given', () => {
    expect(check('email', 'not-an-email')).toBe('Некоректна адреса пошти')
    expect(check('email', '')).toBe(true)
  })
})
