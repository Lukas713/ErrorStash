---
name: forgot-password-user-enumeration
description: forgot-password returns different response body for OAuth-only accounts vs unknown emails, leaking auth method
metadata:
  type: project
---

`src/app/api/auth/forgot-password/route.ts` lines 19-28:
- Unknown email: returns `{ success: true }` with 200
- OAuth-only account (no password): returns `{ error: "This account uses GitHub sign-in..." }` with 400
- Credentials account: silently sends reset email and returns `{ success: true }` with 200

This lets an attacker distinguish between: (a) email not registered, (b) email registered with GitHub OAuth, (c) email registered with credentials. Cases (a) and (c) look the same but case (b) is different.

**Why:** Medium-severity user enumeration — reveals which accounts exist and which auth provider they use. An attacker can confirm whether a target email uses GitHub OAuth on this platform.
**How to apply:** Flag in future audits if still present. Fix is to return `{ success: true }` silently for all cases including OAuth-only accounts.
