# Current Feature — Auth Setup: NextAuth + GitHub Provider

## Status

In Progress

## Goals

- Install NextAuth v5 (`next-auth@beta`) and `@auth/prisma-adapter`
- Set up split auth config pattern for edge compatibility
- Add GitHub OAuth provider
- Protect `/dashboard/*` routes using Next.js 16 proxy
- Redirect unauthenticated users to sign-in

## Notes

**Files to create:**
1. `src/auth.config.ts` — Edge-compatible config (providers only, no adapter)
2. `src/auth.ts` — Full config with Prisma adapter and JWT strategy
3. `src/app/api/auth/[...nextauth]/route.ts` — Export handlers from auth.ts
4. `src/proxy.ts` — Route protection with redirect logic (at `src/` level, same as `app/`)
5. `src/types/next-auth.d.ts` — Extend Session type with `user.id`

**Key gotchas:**
- Use `next-auth@beta` (not `@latest` which installs v4)
- Proxy file must be at `src/proxy.ts`
- Use named export: `export const proxy = auth(...)` not default export
- Use `session: { strategy: 'jwt' }` with split config pattern
- Don't set custom `pages.signIn` — use NextAuth's default page
- Use Context7 to verify the newest config and conventions

**Environment variables needed:**
```
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

**Testing steps:**
1. Go to `/dashboard` — should redirect to sign-in
2. Click "Sign in with GitHub"
3. Verify redirect back to `/dashboard` after auth

## Previous Feature

Quick Wins — Minor Performance & Quality Fixes (Completed)

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
- **2026-06-19** — Quick wins: replaced `include`+JS `.length` with `_count` in non-pro `getTagsWithCounts()`; wrapped sidebar category counts in `useMemo`; added explicit `DATABASE_URL` guard in Prisma singleton; moved `bcryptjs` to `devDependencies`; wired Geist Mono to `--font-mono` in `@theme`; extracted `formatDate` to `src/lib/format.ts`; made `onMenuClick` required in `TopBar` (commit `a9ba9ac`)
