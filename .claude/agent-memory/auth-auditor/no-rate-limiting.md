---
name: no-rate-limiting
description: No rate limiting exists on any custom auth endpoint or the credentials login endpoint
metadata:
  type: project
---

As of 2026-06-22 audit, none of the following endpoints have rate limiting:
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/callback/credentials` (the NextAuth credentials login endpoint)

NextAuth v5 does not add rate limiting to the credentials callback — this is confirmed by the NextAuth maintainers (GitHub discussion #3479). The application must implement this itself.

**Why:** High severity for login endpoint (brute-force passwords); Medium for registration/forgot-password (email flooding, token enumeration).
**How to apply:** Check in each future audit whether rate limiting has been added. Recommended: use `@upstash/ratelimit` or similar on Vercel/Edge, or implement in-memory rate limiting for non-serverless deployments.
