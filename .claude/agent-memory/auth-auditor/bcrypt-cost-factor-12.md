---
name: bcrypt-cost-factor-12
description: bcrypt cost factor is 12 in all password hashing locations; correct and strong
metadata:
  type: project
---

bcrypt is used with cost factor 12 in all three locations:
- `src/app/api/auth/register/route.ts` line 40: `bcrypt.hash(password, 12)`
- `src/app/api/auth/reset-password/route.ts` line 38: `bcrypt.hash(password, 12)`
- `src/actions/user.ts` line 32: `bcrypt.hash(newPassword, 12)`

`bcrypt.compare()` is used (not `===` hash comparison) in:
- `src/auth.ts` line 32: `bcrypt.compare(credentials.password, user.password)`
- `src/actions/user.ts` line 29: `bcrypt.compare(currentPassword, user.password)`

Raw passwords are never logged, stored, or returned. Confirmed passing check.

**Why:** Documents that this is intentionally correct so it's not re-flagged.
**How to apply:** In future audits, just verify these lines haven't changed to a lower cost factor.
