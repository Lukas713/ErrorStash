# Current Feature

## Quick Wins — Minor Performance & Quality Fixes

## Status

In Progress

## Goals

Bundle of low-risk, no-schema, no-auth fixes surfaced by the code-scanner review.

### 1. `getTagsWithCounts()` non-pro path — replace include with `_count`
- **File**: `src/lib/db/error-tags.ts`
- Replace `include: { entries: { select: { errorEntryId: true } } }` + JS `.length` with Prisma's `_count: { select: { entries: true } }`. Avoids loading join rows into memory just to count them.

### 2. Sidebar category counts — add `useMemo`
- **File**: `src/components/layout/Sidebar.tsx`
- Five `.filter()` calls on `entries` run on every render (including every keystroke in tag search). Wrap in a single `useMemo` keyed on `entries`.

### 3. Prisma singleton — explicit env var guard
- **File**: `src/lib/prisma.ts`
- Replace `process.env.DATABASE_URL!` with an explicit check that throws `"DATABASE_URL environment variable is not set"` instead of a confusing adapter-level crash.

### 4. Move `bcryptjs` to `devDependencies`
- **File**: `package.json`
- `bcryptjs` is only used in `prisma/seed.ts` (a dev-time script). Moving it to `devDependencies` keeps it out of the production bundle.

### 5. Remove or wire up unused `geistMono` font
- **File**: `src/app/layout.tsx`, `src/app/globals.css`
- `Geist_Mono` is imported and its CSS variable injected but never referenced in CSS. Either add `--font-mono: var(--font-geist-mono)` to the `@theme` block (good for stack trace code blocks), or remove the import.

### 6. Move `formatDate` to `src/lib/`
- **File**: `src/components/errors/ErrorCard.tsx` → `src/lib/format.ts`
- Pure utility function defined inline in a component file; move per project standards.

### 7. Make `onMenuClick` required in `TopBar`
- **File**: `src/components/layout/TopBar.tsx`
- Prop is typed optional (`onMenuClick?`) but always provided at the only call site. Make it required and remove the dead-code guard inside the component.

## Scope

- `src/lib/db/error-tags.ts` — non-pro query only
- `src/components/layout/Sidebar.tsx` — useMemo for counts
- `src/lib/prisma.ts` — env guard
- `package.json` — devDeps
- `src/app/layout.tsx` + `src/app/globals.css` — font cleanup
- `src/components/errors/ErrorCard.tsx` + `src/lib/format.ts` — formatDate move
- `src/components/layout/TopBar.tsx` — prop type

No schema changes, no migrations, no authentication changes.

## Notes

## Previous Feature

Fix: Pro Tag Query Full Table Scan (Completed)

## History

- **2026-06-11** — Initial Next.js 16 + Tailwind CSS v4 setup with React 19 and TypeScript (commits `b555e9a`, `5490fb8`)
- **2026-06-13** — Dashboard UI Phase 1: ShadCN UI (base-nova) initialized, Button and Input components installed, `/dashboard` route created with dark-mode layout, top bar with search and New button, placeholder Sidebar and Main areas
- **2026-06-14** — Dashboard UI Phase 2: collapsible sidebar with Categories (All Errors, Solved, Unsolved, Favorites, Pinned) and Tags sections, both independently collapsible, New Entry button, user avatar at bottom, mobile drawer overlay, Geist Sans wired as primary font (commit `7aa6d75`)
- **2026-06-14** — Dashboard UI Phase 3: main content area with category label + entry count, newest/oldest sorter, error list with tag pills, solved/unsolved status, date, pin/star/community icons; sidebar category clicks filter the list via shared React context
- **2026-06-14** — Prisma 7 + Neon PostgreSQL setup: installed `prisma@7`, `@prisma/adapter-neon`, `@neondatabase/serverless`; full schema with all models and indexes; `prisma.config.ts` with dotenv for CLI; `src/lib/prisma.ts` singleton with `PrismaNeon` adapter; initial migration `20260614132955_init` applied to Neon dev branch
- **2026-06-15** — Database seed script: `prisma/seed.ts` with demo user, 17 tags, 8 error entries (mix of SOLVED/UNSOLVED, pinned, favorited); wired `npm run db:seed` via `package.json` (commit `736fe92`)
- **2026-06-15** — Dashboard real data: replaced all mock data with Neon/Prisma queries; `src/lib/db/errors.ts` with `getErrorEntries()` and `getCurrentUser()`; entries fetched in server component layout and shared via `DashboardContext`; sidebar counts and tag list now driven by real DB data
- **2026-06-17** — Dashboard real tags: `src/lib/db/error-tags.ts` with `getTagsWithCounts()` (pro users see all tags, non-pro see own); sidebar tags fetched server-side, sorted by count, filtered with inline search, paginated (10 initial + load 5 more), with "Close all" to reset; tags clickable to filter error list (toggle active tag, header updates to `#tagname`, category filter stacks with tag filter)
- **2026-06-17** — Sidebar Pro badge: installed ShadCN `Badge` component; "Pro" badge renders inline next to the username in the sidebar footer when `user.isPro` is true, using `variant="secondary"` for a clean, subtle appearance
