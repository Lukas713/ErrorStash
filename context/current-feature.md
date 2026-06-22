# Current Feature: Forgot Password

## Status

In Progress

## Goals

- Add a "Forgot password?" link on the `/sign-in` page
- `POST /api/auth/forgot-password` — accepts email, creates a `VerificationToken` with a password-reset token and 1h expiry, sends a reset email via Resend
- `GET /api/auth/reset-password?token=...` — validates token, renders a form to set a new password
- `POST /api/auth/reset-password` — validates token again, hashes new password, updates `User.password`, deletes the used token
- `/forgot-password` page — simple email input form
- `/reset-password` page — new password + confirm password form
- Reuse `VerificationToken` model (identifier = user email, token = random UUID, expires = now + 1h)
- Show appropriate error/success toasts and redirect to `/sign-in` after reset

## Notes

- Reuse `EMAIL_VERIFICATION_ENABLED` pattern for email — but reset emails are always sent (no toggle needed)
- Identifier prefix: use `"password-reset:email@example.com"` to avoid collision with email-verification tokens that use plain email as identifier
- Only Credentials users have a password; GitHub OAuth users should see a message that they signed up via GitHub and cannot reset a password
- No rate limiting in v1 — keep it simple

## Previous Feature

Email Verification Dev Toggle (Completed)

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
- **2026-06-20** — Auth setup: NextAuth v5 (next-auth@beta) + GitHub OAuth + PrismaAdapter; split config pattern (auth.config.ts / auth.ts); JWT session strategy with session/jwt callbacks to expose user.id; proxy.ts protects /dashboard/* and redirects unauthenticated users to sign-in; .mcp.json added to .gitignore and untracked (commit `ba89993`)
- **2026-06-20** — Auth Credentials phase 2: Credentials provider added to auth.config.ts (authorize: null placeholder for Edge); overridden in auth.ts with bcrypt validation (deduplicating via explicit GitHub + Credentials list); POST /api/auth/register route with password match, min-length, duplicate email checks and bcrypt hash (cost 12); bcryptjs moved to dependencies (commit `fa190bf`)
- **2026-06-22** — Auth UI phase 3: custom `/sign-in` (email/password + GitHub OAuth) and `/register` pages; reusable `UserAvatar` component (GitHub image or initials fallback); `SidebarUserMenu` replaces static footer with avatar button, name, Pro badge, and dropdown (Profile link + Sign out); `getCurrentUser()` now reads real session via `auth()`; `sonner` Toaster added to root layout; success toast on register (client-side) and sign-in (both providers via `?welcome=1` redirect param + `WelcomeToast` client component) (commit `acafdd2`)
- **2026-06-22** — Email verification on register: `resend` package + `src/lib/email.ts` sends verification email via `onboarding@resend.dev`; `VerificationToken` stored in DB with 24h expiry; `GET /api/auth/verify-email` validates token, sets `emailVerified`, redirects to `/dashboard?welcome=1`; `/verify-email` page shows "Check your inbox"; `proxy.ts` blocks unverified credentials users from `/dashboard`; `auth.ts` exposes `emailVerified` in JWT/session and auto-verifies GitHub OAuth users on first sign-in (commit `94e0a02`)
- **2026-06-22** — Email verification toggle: `EMAIL_VERIFICATION_ENABLED` env var in `.env.local`; set to `"false"` to skip email send and auto-mark `emailVerified` on register (redirects to `/dashboard?welcome=1`); set to `"true"` or omit to use the full Resend verification flow; documented in `.env.example` (commit `f696ee6`)
