# Auth Security Review — 2026-06-22

## Summary

The ErrorStash auth implementation is generally sound in its core mechanics: bcrypt is used correctly at cost factor 12, token generation uses `crypto.randomUUID()` (cryptographically secure), session IDs come from NextAuth's signed JWTs, and server actions correctly take user identity from the server-side session. The most important gaps are the complete absence of rate limiting on all custom auth endpoints including the credentials login route (which NextAuth does not protect automatically), a user-enumeration disclosure in the forgot-password endpoint that reveals whether a given email belongs to a GitHub OAuth account, and a missing try/catch in the email-verification route that leaves DB errors unhandled.

---

## Critical

None found.

---

## High

### No Rate Limiting on Credentials Login or Any Custom Auth Endpoint

- **Files**: `src/app/api/auth/register/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`, and the NextAuth credentials callback at `/api/auth/callback/credentials`
- **Problem**: None of these endpoints implement rate limiting or throttling of any kind. The credentials login endpoint (`POST /api/auth/callback/credentials`) is the most critical: an attacker can attempt unlimited password guesses against any known email address. NextAuth v5 explicitly does not add brute-force protection to the credentials provider — the NextAuth maintainers document this as the application's responsibility (GitHub discussion #3479). The registration endpoint can be used to flood a victim's inbox with verification emails. The forgot-password endpoint can be used to continuously generate and invalidate reset tokens.
- **Fix**: Implement rate limiting at the proxy/middleware layer or inside each route handler. On Vercel Edge, `@upstash/ratelimit` with Redis is the standard approach. A minimal implementation rate-limits by IP: 5 login attempts per minute, 3 forgot-password requests per 15 minutes per IP/email, 10 registration attempts per hour per IP.

```ts
// Example using @upstash/ratelimit in proxy.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
})

// In the proxy function, before forwarding POST /api/auth/callback/credentials:
const ip = req.headers.get("x-forwarded-for") ?? "unknown"
const { success } = await ratelimit.limit(ip)
if (!success) return new Response("Too Many Requests", { status: 429 })
```

---

## Medium

### User Enumeration via Forgot-Password: OAuth Account Disclosure

- **File**: `src/app/api/auth/forgot-password/route.ts` (lines 19–28)
- **Problem**: The endpoint returns three distinct outcomes:
  1. Email not registered: `{ success: true }` with HTTP 200
  2. Email registered with GitHub OAuth (no password): `{ error: "This account uses GitHub sign-in. Please sign in with GitHub instead." }` with HTTP 400
  3. Email registered with credentials: `{ success: true }` with HTTP 200, email sent

  Case 2 is different from both other cases. An attacker can automate requests against a list of email addresses and determine which ones are registered on ErrorStash AND which auth provider they use. This is a confirmed OWASP-documented enumeration class (OWASP Forgot Password Cheat Sheet: "Return a consistent message for both existent and non-existent accounts").

- **Fix**: Always return `{ success: true }` silently for all cases, including OAuth-only accounts. Surface the "use GitHub sign-in" hint only after the user has already authenticated (e.g., in the profile page), not via the unauthenticated reset endpoint.

```ts
// In forgot-password/route.ts, replace the early return:
if (!user || !user.password) {
  // Silently succeed — do not reveal whether the email exists or what provider it uses
  return NextResponse.json({ success: true })
}
```

### Email Verification Route Has No Error Handling

- **File**: `src/app/api/auth/verify-email/route.ts` (entire file, lines 1–30)
- **Problem**: This is the only custom auth route without a try/catch block. Every other auth route (`register`, `forgot-password`, `reset-password`) wraps its logic in try/catch and returns a generic `{ error: "Internal server error" }` on failure. If any Prisma operation in this route throws — for example, `user.update` failing because the token's identifier doesn't correspond to a real email (e.g., a password-reset token mistakenly submitted here would have identifier `password-reset:user@example.com`, which matches no user record and causes Prisma error P2025) — the exception propagates uncaught. In production, Next.js converts this to a generic 500, but the token is not deleted, violating single-use semantics. In development, the stack trace may be exposed.
- **Fix**: Wrap the entire handler body in try/catch, and redirect to an error page on failure rather than letting the exception propagate.

```ts
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")
    if (!token) {
      return NextResponse.redirect(new URL("/sign-in?error=invalid-token", request.nextUrl.origin))
    }
    // ... rest of logic
  } catch {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", request.nextUrl.origin))
  }
}
```

---

## Low / Informational

### Email Verification: User Update and Token Delete Are Not Atomic

- **File**: `src/app/api/auth/verify-email/route.ts` (lines 22–27)
- **Problem**: The `user.update` (marking `emailVerified`) and `verificationToken.delete` are two sequential `await` calls with no transaction:

  ```ts
  await prisma.user.update({ where: { email: record.identifier }, data: { emailVerified: new Date() } })
  await prisma.verificationToken.delete({ where: { token } })
  ```

  If the update succeeds but the delete fails (transient DB error, connection timeout), the token remains valid in the database. For email verification, this is low-impact because re-verifying a verified email is harmless. However, it is inconsistent with the reset-password route which correctly uses `prisma.$transaction([...])`. If the logic ever changes to be non-idempotent, this becomes more serious.

- **Fix**: Use a Prisma interactive transaction as the reset-password route does:

  ```ts
  await prisma.$transaction([
    prisma.user.update({ where: { email: record.identifier }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.delete({ where: { token } }),
  ])
  ```

### Email Addresses Are Not Normalized Before Storage or Lookup

- **Files**: `src/app/api/auth/register/route.ts` (line 32), `src/app/api/auth/forgot-password/route.ts` (line 14)
- **Problem**: Email addresses are stored and queried as-is from user input without lowercasing. RFC 5321 defines the local part of an email as case-sensitive, but in practice all major providers treat addresses as case-insensitive. A user who registers with `User@example.com` and later tries to log in with `user@example.com` will get "account not found" from the Prisma unique lookup, unless the lookup also uses the exact same casing. This can create duplicate accounts (`User@example.com` and `user@example.com` as separate entries) or failed logins.
- **Fix**: Normalize email to lowercase before all DB reads and writes:

  ```ts
  const normalizedEmail = email.toLowerCase().trim()
  ```

  Apply in register (before `findUnique` and `create`), forgot-password (before `findUnique`), and in the Credentials `authorize` function in `auth.ts`.

### Registration Returns a Specific Error Message for Duplicate Emails

- **File**: `src/app/api/auth/register/route.ts` (lines 33–37)
- **Problem**: When a duplicate email is submitted, the response is `{ error: "An account with this email already exists" }` with HTTP 409. This confirms to an attacker that the email is registered on the platform.
- **Context**: This is a documented UX tradeoff. OWASP acknowledges that registration forms commonly reveal email existence because the alternative (silent success with a "check your email" message) creates confusing UX when users accidentally try to register twice. This is low-risk in most applications. It is noted here for completeness — it is not the same class of risk as the forgot-password issue above.
- **Fix** (optional): Return a generic "If this email is not already registered, you will receive a confirmation email" message, or keep the current UX with awareness of the tradeoff.

---

## Passed Checks

- **bcrypt cost factor**: Cost factor 12 is used in all three hashing locations — `register/route.ts` line 40, `reset-password/route.ts` line 38, and `actions/user.ts` line 32. This meets and exceeds the minimum recommended value of 10.
- **bcrypt.compare() used correctly**: Password verification uses `bcrypt.compare()` in both `auth.ts` line 32 (Credentials authorize) and `actions/user.ts` line 29 (changePasswordAction). No raw hash comparison (`===`) is present.
- **Raw passwords never exposed**: No log statements, response bodies, or DB fields contain the raw password. The `select` clauses in DB queries never return `password` to the client; `register/route.ts` line 51 returns only `{ id, name, email }`.
- **Token generation is cryptographically secure**: `crypto.randomUUID()` (imported from Node's built-in `crypto` module) is used for both email verification tokens (`register/route.ts` line 54) and password reset tokens (`forgot-password/route.ts` line 34). This generates a v4 UUID backed by a CSPRNG — equivalent entropy to `crypto.randomBytes(16)`.
- **Token expiry enforced at point of use**: Both `verify-email/route.ts` line 17 and `reset-password/route.ts` line 30 check `record.expires < new Date()` before accepting the token. Expiry is not just set on creation.
- **Token namespace isolation (reset -> verify direction)**: `reset-password/route.ts` line 26 checks `record.identifier.startsWith("password-reset:")` before processing. An email-verification token (identifier = plain email) submitted to the reset-password endpoint would fail this check and be rejected.
- **Token single-use enforced in reset-password**: `reset-password/route.ts` lines 40–43 use `prisma.$transaction([user.update, verificationToken.delete])` — the token is atomically deleted with the password update, preventing reuse.
- **Expired verification token is deleted**: `verify-email/route.ts` line 19 deletes expired tokens when they are presented, preventing accumulation of stale tokens.
- **Existing reset tokens invalidated on new request**: `forgot-password/route.ts` lines 30–32 call `prisma.verificationToken.deleteMany({ where: { identifier: "password-reset:<email>" } })` before creating a new token, so only one valid reset token exists per email at any time.
- **Session identity from server-side session only**: `changePasswordAction` (`actions/user.ts` line 8) and `deleteAccountAction` (line 42) both call `auth()` server-side and use `session.user.id`. No user ID is accepted from form fields or request parameters.
- **changePasswordAction requires current password**: `actions/user.ts` lines 29–30 verify the current password with `bcrypt.compare()` before allowing the change. The action requires the user to know the existing password.
- **deleteAccountAction uses server-side session ID**: `actions/user.ts` line 45 passes `session.user.id` (from `auth()`) directly to `prisma.user.delete`. The client cannot supply a different user ID.
- **Profile page redirects unauthenticated users**: `profile/page.tsx` line 13 calls `getProfileData()` which checks `session?.user?.id` and returns null if absent; the page then calls `redirect("/sign-in")`. Additionally, `proxy.ts` line 4 lists `/profile` in the `PROTECTED` matcher and redirects unauthenticated requests before the page renders.
- **Email verification blocks dashboard access**: `proxy.ts` lines 13–18 check `req.auth.user?.emailVerified` for all protected routes and redirect unverified users to `/verify-email`. This applies to `/dashboard/:path*` and `/profile`.
- **GitHub OAuth users are auto-verified**: `auth.ts` lines 53–67 set `emailVerified` on first GitHub sign-in if not already set, preventing OAuth users from being blocked by the email-verification proxy check.
- **Email content has no user-controlled HTML**: `email.ts` constructs URLs from `process.env.NEXTAUTH_URL` (trusted env var) and a `token` value that is a UUID (no special characters, no user input). No user-supplied fields (name, email displayed as text) are interpolated into the HTML body.
- **Password validation in reset-password**: `reset-password/route.ts` lines 13–20 enforce minimum length (8 chars) and password confirmation match before any DB operation.
- **No password requirements skipped on change**: `actions/user.ts` lines 19–20 enforce the same minimum length and confirmation match as the registration flow.
- **Try/catch on all routes except verify-email**: `register/route.ts`, `forgot-password/route.ts`, and `reset-password/route.ts` all wrap their entire body in try/catch and return generic 500 responses on failure.
- **proxy.ts is the correct Next.js 16 middleware convention**: `src/proxy.ts` is the renamed equivalent of `middleware.ts` in Next.js 16. The export name `proxy` and the `config.matcher` export are both correctly structured.

---

## Not Audited (Out of Scope)

The following are handled automatically by NextAuth v5 and were intentionally excluded from this review:

- **CSRF protection**: NextAuth uses signed JWT tokens and enforces SameSite cookie policy on all its own endpoints.
- **Cookie security flags** (HttpOnly, Secure, SameSite=Lax): Set automatically by NextAuth on session cookies.
- **OAuth state parameter and PKCE**: NextAuth handles GitHub OAuth CSRF protection internally.
- **Session token generation and signing**: NextAuth generates and signs JWTs using `NEXTAUTH_SECRET`. Token forgery is not possible without the secret.
- **Cookie expiry**: Managed via JWT `exp` claims by NextAuth.
- **Callback URL validation**: NextAuth validates `callbackUrl` against trusted origins.
- **GitHub provider brute-force**: GitHub's own rate limiting applies to OAuth flows.
