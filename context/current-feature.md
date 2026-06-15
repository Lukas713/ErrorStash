# Current Feature

Dashboard — Real Errors from Database

## Status

Completed

## Goals

- Create `src/lib/db/errors.ts` with data fetching functions
- Replace mock data in the dashboard main area with real errors from Neon via Prisma
- Fetch errors directly in server component
- Keep the current design (reference `context/screenshots/dashboard-ui-main.png`)
- Update errors stats display

## Notes

- Spec: `context/features/dashboard-collections-spec`
- Replace `src/lib/mock-data.ts` usage with Prisma queries

## Previous Feature

Database Seed Script (Completed)

- Spec: `context/features/seed-spec.md`

## History

- **2026-06-11** — Initial Next.js 16 + Tailwind CSS v4 setup with React 19 and TypeScript (commits `b555e9a`, `5490fb8`)
- **2026-06-13** — Dashboard UI Phase 1: ShadCN UI (base-nova) initialized, Button and Input components installed, `/dashboard` route created with dark-mode layout, top bar with search and New button, placeholder Sidebar and Main areas
- **2026-06-14** — Dashboard UI Phase 2: collapsible sidebar with Categories (All Errors, Solved, Unsolved, Favorites, Pinned) and Tags sections, both independently collapsible, New Entry button, user avatar at bottom, mobile drawer overlay, Geist Sans wired as primary font (commit `7aa6d75`)
- **2026-06-14** — Dashboard UI Phase 3: main content area with category label + entry count, newest/oldest sorter, error list with tag pills, solved/unsolved status, date, pin/star/community icons; sidebar category clicks filter the list via shared React context
- **2026-06-14** — Prisma 7 + Neon PostgreSQL setup: installed `prisma@7`, `@prisma/adapter-neon`, `@neondatabase/serverless`; full schema with all models and indexes; `prisma.config.ts` with dotenv for CLI; `src/lib/prisma.ts` singleton with `PrismaNeon` adapter; initial migration `20260614132955_init` applied to Neon dev branch
- **2026-06-15** — Database seed script: `prisma/seed.ts` with demo user, 17 tags, 8 error entries (mix of SOLVED/UNSOLVED, pinned, favorited); wired `npm run db:seed` via `package.json` (commit `736fe92`)
- **2026-06-15** — Dashboard real data: replaced all mock data with Neon/Prisma queries; `src/lib/db/errors.ts` with `getErrorEntries()` and `getCurrentUser()`; entries fetched in server component layout and shared via `DashboardContext`; sidebar counts and tag list now driven by real DB data
