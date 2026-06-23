---
name: proxy-ts-is-middleware
description: In Next.js 16, src/proxy.ts is the correct name for what was middleware.ts
metadata:
  type: project
---

Next.js 16 renamed `middleware.ts` to `proxy.ts`. The function export must also be named `proxy` instead of `middleware`. The file at `src/proxy.ts` in this project is correctly named and correctly exports `proxy`.

**Why:** Avoids false-positive finding that "middleware is missing" when the file exists under the new name.
**How to apply:** When looking for route protection middleware in this project, look for `src/proxy.ts`, not `src/middleware.ts`.
