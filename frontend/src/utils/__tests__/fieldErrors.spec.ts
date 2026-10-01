import { describe, expect, it } from 'vitest'

import { fieldErrors } from '../fieldErrors'

describe('fieldErrors', () => {
  it('keeps violations of the given fields only', () => {
    const details = {
      fields: [
        { field: 'email', problem: 'must be an email' },
        { field: 'shop_id', problem: 'unexpected' },
      ],
    }

    expect(fieldErrors(details, ['name', 'email'])).toEqual({ email: 'must be an email' })
  })

  it('ignores details of other errors', () => {
    expect(fieldErrors({ limit: 30 }, ['name'])).toEqual({})
    expect(fieldErrors(undefined, ['name'])).toEqual({})
  })
})
