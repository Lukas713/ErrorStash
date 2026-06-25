import { describe, it, expect } from 'vitest'
import { formatDate } from './format'

describe('formatDate', () => {
  it('formats an ISO date as "Mon D, YYYY"', () => {
    expect(formatDate('2026-06-25T12:00:00.000Z')).toBe('Jun 25, 2026')
  })

  it('formats a single-digit day without zero padding', () => {
    // Noon UTC keeps the calendar day stable across timezones.
    expect(formatDate('2025-01-01T12:00:00.000Z')).toBe('Jan 1, 2025')
  })
})
