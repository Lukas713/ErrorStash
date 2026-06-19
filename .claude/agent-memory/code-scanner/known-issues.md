---
name: known-issues
description: Issues identified in the 2026-06-19 code review that should be checked for regression or follow-up
metadata:
  type: project
---

Issues flagged in the 2026-06-19 full-codebase review:

**Critical:**
- `getErrorEntries()` has no user scoping — returns ALL users' data with no WHERE clause. Hardcoded demo user means no isolation.
- `getTagsWithCounts()` Pro branch: full table scan on `Tag` with no WHERE clause, JS-side grouping. (Current feature as of 2026-06-19 targets this fix — check if resolved in next review.)
- Schema/migration drift: `password String?` exists in `schema.prisma` but is absent from the sole migration file (`20260614132955_init`). DB is out of sync.

**High:**
- `getErrorEntries()` fetches every column of every entry for every user with no pagination and no `select` to limit fields. Will degrade as data grows.
- `getTagsWithCounts()` non-pro path also over-fetches: loads all ErrorTag join rows into memory when only the count is needed. Should use `_count` in a `groupBy` or Prisma aggregate.
- `bcryptjs` is listed as a runtime `dependency` but is only used in `prisma/seed.ts` — should be a `devDependency`.
- `ErrorCard` has no `'use client'` directive but is rendered inside `ErrorList` which is a client component. This is fine architecturally but `ErrorCard` is effectively a client component — it uses `cursor-pointer`, `hover` states, and will need onClick. No actual bug now, but misrepresents the component boundary.

**Medium:**
- `getCurrentUser()` hardcodes `demo@errorstash.io` — must be replaced with real session lookup when NextAuth is wired up.
- `ErrorEntryWithTags` and `DashboardUser` types are in `src/lib/db/errors.ts`; `TagWithCount` in `src/lib/db/error-tags.ts`. Project standard is `src/types/`.
- IIFE inline in `Sidebar.tsx` JSX (lines 134–157) to decide pagination button. Logic belongs in a named function or extracted component.
- `DashboardShell` is `'use client'` solely to manage a single `sidebarOpen` boolean, forcing the entire shell and context provider to be client components.
- Sidebar counts (allCount, solvedCount, etc.) at lines 25–29 of `Sidebar.tsx` re-derive counts from `entries` array on every render. These could be derived via `useMemo`.
- `TopBar` is stateless (no `'use client'`) but receives an `onMenuClick` prop — fine because the parent passes a function. However the `onMenuClick` prop is typed as optional (`?`) while the caller always provides it.

**Low:**
- `formatDate` utility function defined inline in `ErrorCard.tsx` instead of `src/lib/`.
- Prisma singleton uses `process.env.DATABASE_URL!` non-null assertion — will crash at runtime with an unhelpful error if the env var is missing.
- `geistMono` font is loaded in root layout but never used in CSS (only `--font-geist-sans` is referenced in `globals.css @theme`).
- `src/app/page.tsx` renders a bare `<h1>ErrorStash</h1>` with no layout — fine as placeholder but will need to be a proper landing page or redirect.
