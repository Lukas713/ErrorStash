---
name: randomUUID-is-secure
description: crypto.randomUUID() from Node built-in is cryptographically secure; used correctly in this project
metadata:
  type: project
---

`crypto.randomUUID()` (from Node's built-in `crypto` module) generates a v4 UUID using a cryptographically secure random number generator. It is equivalent to `crypto.randomBytes(16)` in terms of entropy. This is confirmed by MDN and Node.js documentation.

Used in this project:
- `src/app/api/auth/register/route.ts` line 54: email verification token
- `src/app/api/auth/forgot-password/route.ts` line 34: password reset token

Both are correct. Do not flag as a finding.

**Why:** Prevents re-flagging a passing check as a concern.
**How to apply:** When auditing token generation, crypto.randomUUID() is acceptable and does not need to be replaced with crypto.randomBytes().
