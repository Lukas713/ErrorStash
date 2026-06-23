---
name: token-namespace-scheme
description: Token identifier convention in the VerificationToken table
metadata:
  type: project
---

This project stores two types of tokens in the same `VerificationToken` table:
- Email verification tokens: `identifier = "<email>"` (plain email address)
- Password reset tokens: `identifier = "password-reset:<email>"`

The reset-password route checks `record.identifier.startsWith("password-reset:")` to prevent cross-use of email verification tokens as reset tokens.

The verify-email route does NOT check the identifier format — it only queries by token value. However, a password-reset token submitted to verify-email would fail because `prisma.user.update({ where: { email: "password-reset:user@example.com" } })` would find no matching user and throw a Prisma error (which is unhandled — see separate finding).

**Why:** Important for understanding token cross-use attack surface.
**How to apply:** When auditing token validation logic, check both directions of potential cross-use.
