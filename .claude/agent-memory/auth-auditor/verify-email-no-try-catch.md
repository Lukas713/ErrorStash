---
name: verify-email-no-try-catch
description: verify-email API route has no try/catch; any DB error propagates as 500 with potential stack trace
metadata:
  type: project
---

`src/app/api/auth/verify-email/route.ts` has no try/catch block at all. All other auth routes (register, forgot-password, reset-password) have try/catch with generic 500 responses. This route does not.

If the Prisma `user.update` or `verificationToken.delete` calls throw, the error propagates uncaught and Next.js returns a 500 with no body, or in development mode potentially leaks the stack trace.

Specific scenario where this throws: a password-reset token (identifier = "password-reset:email@example.com") submitted to this endpoint — the update where `email = "password-reset:email@example.com"` will find no record and Prisma throws P2025 (Record to update not found).

**Why:** Robustness issue, low security impact in production (Next.js converts unhandled errors to generic 500s in prod), but should be fixed for consistency and to prevent double-consuming tokens.
**How to apply:** Flag in future audits if still missing.
