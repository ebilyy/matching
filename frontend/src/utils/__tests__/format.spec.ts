import { describe, expect, it } from 'vitest'

import { formatDateTime, formatPercent } from '../format'

describe('formatDateTime', () => {
  it('shows UTC instants in Kyiv time', () => {
    // 21:30 UTC on 1 Oct = 00:30 on 2 Oct in Kyiv (UTC+3, summer time).
    expect(formatDateTime('2026-10-01T21:30:00Z')).toBe('02.10.26, 00:30')
  })

  it('renders a dash for missing values', () => {
    expect(formatDateTime(null)).toBe('—')
  })
})

describe('formatPercent', () => {
  it('keeps one decimal', () => {
    expect(formatPercent(0.922)).toMatch(/^92,2\s?%$/)
  })
})
