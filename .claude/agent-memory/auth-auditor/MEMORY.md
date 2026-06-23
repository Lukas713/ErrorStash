# Auth Auditor Memory Index

- [proxy-ts-is-middleware](proxy-ts-is-middleware.md) — In Next.js 16, `src/proxy.ts` replaces `middleware.ts`; this is correct and intentional
- [token-namespace-scheme](token-namespace-scheme.md) — Password reset tokens use `password-reset:<email>` as the VerificationToken identifier; email verify tokens use plain `<email>`
- [verify-email-no-try-catch](verify-email-no-try-catch.md) — `src/app/api/auth/verify-email/route.ts` has no try/catch; DB errors propagate as unhandled exceptions
- [forgot-password-user-enumeration](forgot-password-user-enumeration.md) — `/api/auth/forgot-password` returns a different error body for OAuth-only accounts vs unknown emails; leaks auth method
- [no-rate-limiting](no-rate-limiting.md) — No rate limiting on register, forgot-password, reset-password, or the credentials login endpoint; confirmed NextAuth does not add this automatically
- [verify-email-non-atomic](verify-email-non-atomic.md) — verify-email does user.update then token.delete as two separate DB calls with no transaction; token survives if update throws
- [bcrypt-cost-factor-12](bcrypt-cost-factor-12.md) — bcrypt cost factor is 12 in all three locations (register, reset-password, changePasswordAction); correct
- [randomUUID-is-secure](randomUUID-is-secure.md) — `crypto.randomUUID()` from Node built-in is cryptographically secure (confirmed); used for both token types
