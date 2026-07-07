import { describe, it, expect } from 'vitest'
import { paletteFilter } from './search'

describe('paletteFilter', () => {
  const value = 'Prisma migration failed private migrate resolve --applied'

  it('keeps an item when the query is a substring', () => {
    expect(paletteFilter(value, 'prisma')).toBe(1)
  })

  it('is case-insensitive', () => {
    expect(paletteFilter(value, 'PRISMA')).toBe(1)
  })

  it('matches all tokens regardless of order (AND semantics)', () => {
    expect(paletteFilter(value, 'migration prisma')).toBe(1)
  })

  it('filters out an item when any token is missing', () => {
    expect(paletteFilter(value, 'prisma docker')).toBe(0)
  })

  it('does not scatter-match letters as a subsequence', () => {
    // "pmf" are the leading letters of Prisma/migration/failed but not a substring
    expect(paletteFilter(value, 'pmf')).toBe(0)
  })

  it('keeps every item for an empty query', () => {
    expect(paletteFilter(value, '')).toBe(1)
    expect(paletteFilter(value, '   ')).toBe(1)
  })

  it('searches provided keywords in addition to the value', () => {
    expect(paletteFilter('some title', 'react', ['react', 'hooks'])).toBe(1)
    expect(paletteFilter('some title', 'vue', ['react', 'hooks'])).toBe(0)
  })
})
