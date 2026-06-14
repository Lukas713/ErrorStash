# Current Feature

Prisma + Neon PostgreSQL Setup

## Status

Completed

## Goals

- Install and configure Prisma 7 ORM
- Set up Neon PostgreSQL (serverless) as the database provider
- Create initial schema based on data models in `context/project-overview.md` (ErrorEntry, Tag, ErrorTag, User)
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Create initial migration (never use `prisma db push`)
- Wire `DATABASE_URL` via `.env.local`

## Notes

- Spec: `context/features/database-spec.md`
- Data models reference: `context/project-overview.md`
- Coding standards (DB section): `context/coding-standards.md`
- Use Prisma 7 — has breaking changes; read upgrade guide before starting
- Development branch in `DATABASE_URL`, production branch separate
- Always use `prisma migrate dev` for schema changes

## Previous Feature

Dashboard UI Phase 3 — main content area with error list (Completed)

- Phase 1 spec: `context/features/dashboard-phase-1-spec.md`
- Phase 2 spec: `context/features/dashboard-phase-2-spec.md`

## History

- **2026-06-11** — Initial Next.js 16 + Tailwind CSS v4 setup with React 19 and TypeScript (commits `b555e9a`, `5490fb8`)
- **2026-06-13** — Dashboard UI Phase 1: ShadCN UI (base-nova) initialized, Button and Input components installed, `/dashboard` route created with dark-mode layout, top bar with search and New button, placeholder Sidebar and Main areas
- **2026-06-14** — Dashboard UI Phase 2: collapsible sidebar with Categories (All Errors, Solved, Unsolved, Favorites, Pinned) and Tags sections, both independently collapsible, New Entry button, user avatar at bottom, mobile drawer overlay, Geist Sans wired as primary font (commit `7aa6d75`)
- **2026-06-14** — Dashboard UI Phase 3: main content area with category label + entry count, newest/oldest sorter, error list with tag pills, solved/unsolved status, date, pin/star/community icons; sidebar category clicks filter the list via shared React context
- **2026-06-14** — Prisma 7 + Neon PostgreSQL setup: installed `prisma@7`, `@prisma/adapter-neon`, `@neondatabase/serverless`; full schema with all models and indexes; `prisma.config.ts` with dotenv for CLI; `src/lib/prisma.ts` singleton with `PrismaNeon` adapter; initial migration `20260614132955_init` applied to Neon dev branch
