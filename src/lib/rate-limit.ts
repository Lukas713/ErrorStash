import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

export function getIP(request: Request): string {
  const xff = request.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return "unknown"
}

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function checkRateLimit(
  identifier: string,
  requests: number,
  window: `${number} ${"ms" | "s" | "m" | "h" | "d"}`
): Promise<RateLimitResult> {
  const client = getRedis()
  if (!client) {
    return { success: true, remaining: -1, reset: 0 }
  }

  try {
    const limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: false,
    })

    const result = await limiter.limit(identifier)
    return { success: result.success, remaining: result.remaining, reset: result.reset }
  } catch {
    // Fail open on Redis errors
    return { success: true, remaining: -1, reset: 0 }
  }
}

export function rateLimitResponse(reset: number): NextResponse {
  const retryAfterSeconds = Math.max(Math.ceil((reset - Date.now()) / 1000), 0)
  const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60)
  return NextResponse.json(
    { error: `Too many attempts. Please try again in ${retryAfterMinutes} minute${retryAfterMinutes !== 1 ? "s" : ""}.` },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  )
}
