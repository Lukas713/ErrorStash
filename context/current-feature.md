# Current Feature

Database Seed Script

## Status

In Progress

## Goals

- Create `prisma/seed.ts` with realistic developer error data
- Seed 1 demo user (`demo@errorstash.io`)
- Seed 17 tags (react, hooks, typescript, nextjs, prisma, postgresql, database, docker, devops, css, tailwind, api, cors, nodejs, npm, git, ssr)
- Seed 8 error entries — mix of SOLVED/UNSOLVED, some pinned, some favorited
- Script must be idempotent (safe to re-run)
- Wire `npm run db:seed` and `npx prisma db seed` via `package.json`

## Notes

- Spec: `context/features/seed-spec.md`
- Run with: `npm run db:seed`
- Uses `tsx` to execute TypeScript directly (installed as dev dependency)
- Loads `.env.local` via dotenv at top of seed file (same pattern as `prisma.config.ts`)
- Imports `PrismaClient` from `src/generated/prisma/client` with `PrismaNeon` adapter

## Previous Feature

Prisma + Neon PostgreSQL Setup (Completed)

- Spec: `context/features/database-spec.md`

## History

- **2026-06-11** — Initial Next.js 16 + Tailwind CSS v4 setup with React 19 and TypeScript (commits `b555e9a`, `5490fb8`)
- **2026-06-13** — Dashboard UI Phase 1: ShadCN UI (base-nova) initialized, Button and Input components installed, `/dashboard` route created with dark-mode layout, top bar with search and New button, placeholder Sidebar and Main areas
- **2026-06-14** — Dashboard UI Phase 2: collapsible sidebar with Categories (All Errors, Solved, Unsolved, Favorites, Pinned) and Tags sections, both independently collapsible, New Entry button, user avatar at bottom, mobile drawer overlay, Geist Sans wired as primary font (commit `7aa6d75`)
- **2026-06-14** — Dashboard UI Phase 3: main content area with category label + entry count, newest/oldest sorter, error list with tag pills, solved/unsolved status, date, pin/star/community icons; sidebar category clicks filter the list via shared React context
- **2026-06-14** — Prisma 7 + Neon PostgreSQL setup: installed `prisma@7`, `@prisma/adapter-neon`, `@neondatabase/serverless`; full schema with all models and indexes; `prisma.config.ts` with dotenv for CLI; `src/lib/prisma.ts` singleton with `PrismaNeon` adapter; initial migration `20260614132955_init` applied to Neon dev branch
