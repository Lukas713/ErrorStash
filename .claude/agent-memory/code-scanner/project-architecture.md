---
name: project-architecture
description: Key architectural patterns and conventions observed in the ErrorStash codebase
metadata:
  type: project
---

ErrorStash is a Next.js 16 App Router app with a dashboard at `/dashboard` (no auth guard yet; demo user hardcoded via `getCurrentUser()` in `src/lib/db/errors.ts`).

**Architecture patterns observed:**
- Server data is fetched in `src/app/dashboard/layout.tsx` (async Server Component), passed as props to `DashboardShell` (Client Component), then stored in `DashboardContext` for client-side filtering/sorting.
- `'use client'` is used on `DashboardShell`, `Sidebar`, `ErrorList`, `DashboardProvider` — all justified by interactivity.
- `ErrorCard` is a Server Component (no directive) receiving props.
- Filtering and sorting of entries happens fully client-side inside `ErrorList.tsx`.
- Types `ErrorEntryWithTags` and `DashboardUser` are defined in `src/lib/db/errors.ts`; `TagWithCount` in `src/lib/db/error-tags.ts`. Project standard is `src/types/`.
- No Server Actions, no API routes, no auth integration exist yet in the codebase (as of 2026-06-19).
- ShadCN components use Base UI primitives (not Radix), installed via `shadcn@4` — `Badge`, `Button`, `Input` all use `@base-ui/react`.
- Prisma client is generated to `src/generated/prisma` (non-standard output path).
- `bcryptjs` is in dependencies (not devDependencies) and is imported only in `prisma/seed.ts`.

**Why:** Useful context for future reviews to distinguish "not yet built" from "bug".
**How to apply:** Do not flag missing API routes, auth checks, or Server Actions as issues — they are not implemented yet.
