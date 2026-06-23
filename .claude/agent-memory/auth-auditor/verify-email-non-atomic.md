---
name: verify-email-non-atomic
description: verify-email does user.update then token.delete as two separate DB calls with no transaction
metadata:
  type: project
---

`src/app/api/auth/verify-email/route.ts` lines 22-27:
```ts
await prisma.user.update({ where: { email: record.identifier }, data: { emailVerified: new Date() } })
await prisma.verificationToken.delete({ where: { token } })
```

These are two separate awaits with no `prisma.$transaction([...])` wrapper. If the user.update succeeds but the token.delete fails (network blip, DB timeout), the token remains valid and could be reused to re-verify (harmless here) or the state is inconsistent. Contrast with reset-password which correctly uses `prisma.$transaction([...])`.

**Why:** Low-severity consistency issue. The practical impact is low since email verification is idempotent (re-verifying the same email doesn't grant extra access), but it violates single-use enforcement.
**How to apply:** Flag if still present in future audits. Fix: wrap both operations in `prisma.$transaction([...])`.
