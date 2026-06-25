import { describe, it, expect } from 'vitest'
import { getIP, rateLimitResponse } from './rate-limit'

describe('getIP', () => {
  it('returns the first IP from x-forwarded-for', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '203.0.113.1, 70.41.3.18' },
    })
    expect(getIP(req)).toBe('203.0.113.1')
  })

  it('trims whitespace around the IP', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '  203.0.113.7  ' },
    })
    expect(getIP(req)).toBe('203.0.113.7')
  })

  it('returns "unknown" when the header is absent', () => {
    const req = new Request('https://example.com')
    expect(getIP(req)).toBe('unknown')
  })
})

describe('rateLimitResponse', () => {
  it('responds with 429 and a Retry-After header', async () => {
    const reset = Date.now() + 90_000 // 90s -> rounds up to 2 minutes
    const res = rateLimitResponse(reset)

    expect(res.status).toBe(429)
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0)

    const body = await res.json()
    expect(body.error).toContain('2 minutes')
  })

  it('clamps a past reset time to a non-negative Retry-After', () => {
    const res = rateLimitResponse(Date.now() - 10_000)
    expect(Number(res.headers.get('Retry-After'))).toBe(0)
  })
})
