# ErrorStash — Project Overview

> A fast, searchable, AI-enhanced hub where developers log errors, store solutions, and — on Pro — tap into a shared community database of real-world fixes.

---

## Table of Contents

1. [Problem](#problem)
2. [Users](#users)
3. [Features](#features)
4. [Data Models](#data-models)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Monetization](#monetization)
8. [UI / UX](#ui--ux)
9. [Routes](#routes)
10. [Future Scope](#future-scope)

---

## Problem

Developers constantly stumble upon the same errors — and forget how they fixed them. Solutions end up scattered across:

- Browser history and random Google searches
- Stack Overflow bookmarks that are never revisited
- Chat histories with AI assistants
- Commented-out code in old projects
- Mental notes that fade within a week

This creates repeated debugging cycles, lost knowledge, and frustration. **ErrorStash** solves this with one place to log, tag, search, and fix errors — forever.

---

## Users

| User | Need |
|---|---|
| **Solo Developer** | Fast personal error log, searchable later by tag or keyword |
| **Team / Company** | Shared internal knowledge base so teammates don't repeat debugging sessions |
| **Pro Community Member** | Search across all pro users' public errors to find solutions others already solved |
| **Student** | Personal error diary that tracks growth and common pitfalls over time |

---

## Features

### A. Error Entries

Each entry contains:

| Field | Notes |
|---|---|
| **Title** | Required — short name for the error |
| **Description** | What the developer was doing, what they tried. Markdown supported. |
| **Stack Trace** | Raw error output — monospaced code block |
| **Solution** | How it was fixed. Markdown supported. |
| **Tags** | AI-generated on save + developer can add/remove custom tags |
| **Status** | `unsolved` or `solved` |
| **Visibility** | `private` (free) or `public` (pro — shared to community) |
| **isFavorite** | Star important entries |
| **isPinned** | Pin to top of list |

> Entry creation and editing happens in a **quick-access side drawer** — no full page navigation needed.

---

### B. Tags

- On save, **Claude AI auto-suggests tags** based on title, description, and stack trace
- Developer can accept, remove, or add their own custom tags
- Sidebar shows all tags the user has used with entry counts — click to filter
- Pro users can browse and filter by tags across the community database

---

### C. Search

| Tier | Capability |
|---|---|
| **Free** | Full-text search across own entries (title + description) |
| **Pro** | Search extends to the community database — other pro users' public entries |
| **Both** | Filter by tag, filter by status (`solved` / `unsolved`) |

---

### D. Authentication

- Email / password
- GitHub OAuth
- Powered by **NextAuth v5**

---

### E. Community *(Pro Only)*

- Pro users mark entries as **public** — visible to all pro members
- Pro search queries the shared community database
- Entries show author username and date
- No editing other users' entries

---

### F. General Features

- Markdown editor for Description and Solution fields
- Syntax-highlighted code block for Stack Trace
- Recently viewed entries
- Favorites and pinned entries
- Dark mode by default, light mode toggle
- Toast notifications for all actions
- Loading skeletons for async states
- Responsive — desktop-first, sidebar becomes drawer on mobile

---

### G. AI Features *(Pro Only)*

| Feature | Description |
|---|---|
| **AI Auto-Tagging** | Claude analyzes title + description + stack trace and suggests relevant tags on save |
| **AI Solution Suggestion** | Claude proposes a possible fix or debugging path based on the error content |

> **During development**: all users have access to all features including Pro and AI.

---

## Data Models

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                     String       @id @default(cuid())
  name                   String?
  email                  String       @unique
  emailVerified          DateTime?
  image                  String?
  isPro                  Boolean      @default(false)
  stripeCustomerId       String?      @unique
  stripeSubscriptionId   String?      @unique
  createdAt              DateTime     @default(now())

  accounts               Account[]
  sessions               Session[]
  errorEntries           ErrorEntry[]
  tags                   Tag[]
}

model ErrorEntry {
  id          String      @id @default(cuid())
  title       String
  description String?
  stackTrace  String?
  solution    String?
  status      Status      @default(UNSOLVED)
  isPublic    Boolean     @default(false)
  isFavorite  Boolean     @default(false)
  isPinned    Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  tags        ErrorTag[]
}

model Tag {
  id          String      @id @default(cuid())
  name        String

  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  entries     ErrorTag[]

  @@unique([name, userId]) // same tag name can exist across users, unique per user
}

model ErrorTag {
  errorEntryId  String
  tagId         String
  addedAt       DateTime    @default(now())

  errorEntry    ErrorEntry  @relation(fields: [errorEntryId], references: [id], onDelete: Cascade)
  tag           Tag         @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([errorEntryId, tagId]) // composite primary key
}

enum Status {
  UNSOLVED
  SOLVED
}

// --- NextAuth required models ---

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

### Entity Relationship Diagram

```
┌─────────────┐       ┌───────────────┐       ┌──────────┐
│    User     │       │  ErrorEntry   │       │   Tag    │
│─────────────│       │───────────────│       │──────────│
│ id          │──┐    │ id            │    ┌──│ id       │
│ name        │  │    │ title         │    │  │ name     │
│ email       │  │    │ description   │    │  │ userId   │
│ isPro       │  ├───▶│ stackTrace    │    │  └──────────┘
│ stripeId    │  │    │ solution      │    │       ▲
│ createdAt   │  │    │ status        │    │       │
└─────────────┘  │    │ isPublic      │    │  ┌────────────┐
                 │    │ isFavorite    │    │  │  ErrorTag  │
                 │    │ isPinned      │    │  │────────────│
                 │    │ userId        │    └──│ tagId      │
                 │    └───────────────┘       │ errorId    │
                 │           │                │ addedAt    │
                 │           └───────────────▶└────────────┘
                 │
                 └──▶ Account, Session (NextAuth)
```

---

## Tech Stack

| Layer | Technology | Docs |
|---|---|---|
| **Framework** | Next.js 16 / React 19 | [nextjs.org](https://nextjs.org/docs) |
| **Language** | TypeScript | [typescriptlang.org](https://www.typescriptlang.org/docs) |
| **Database** | Neon (PostgreSQL) | [neon.tech](https://neon.tech/docs) |
| **ORM** | Prisma 7 | [prisma.io/docs](https://www.prisma.io/docs) |
| **Auth** | NextAuth v5 | [authjs.dev](https://authjs.dev) |
| **AI** | Anthropic Claude API | [docs.anthropic.com](https://docs.anthropic.com) |
| **CSS** | Tailwind CSS v4 + ShadCN UI | [ui.shadcn.com](https://ui.shadcn.com) |
| **Payments** | Stripe | [stripe.com/docs](https://stripe.com/docs) |
| **Deployment** | Vercel | [vercel.com/docs](https://vercel.com/docs) |

**Key rules:**
- ⚠️ **NEVER use `prisma db push`** — always create and run migrations with `prisma migrate dev`
- API routes handle all AI calls, entry mutations, and tag operations
- Single monorepo — one codebase, one deployment

---

## Project Structure

```
errorstash/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages group (no sidebar layout)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # Main app group (with sidebar layout)
│   │   ├── layout.tsx            # Sidebar + main layout wrapper
│   │   ├── page.tsx              # Home — all errors feed
│   │   ├── errors/[id]/page.tsx  # Single error (fallback if no drawer)
│   │   └── settings/page.tsx     # User settings
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── errors/               # CRUD for error entries
│   │   ├── tags/                 # Tag management
│   │   ├── ai/
│   │   │   ├── tag/              # AI auto-tagging endpoint
│   │   │   └── suggest/          # AI solution suggestion endpoint
│   │   └── stripe/
│   │       └── webhook/          # Stripe webhook (flips isPro)
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── ui/                       # ShadCN generated components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── errors/
│   │   ├── ErrorList.tsx         # Main feed
│   │   ├── ErrorCard.tsx         # Single list item
│   │   ├── ErrorDrawer.tsx       # Quick-access side drawer
│   │   └── ErrorForm.tsx         # Create / edit form
│   ├── tags/
│   │   ├── TagList.tsx           # Sidebar tag list with counts
│   │   └── TagPill.tsx           # Colored tag badge
│   └── ai/
│       └── AISuggestions.tsx     # Shows AI tags + solution
│
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # NextAuth config
│   ├── anthropic.ts              # Claude API client
│   └── stripe.ts                 # Stripe client
│
├── prisma/
│   ├── schema.prisma             # Data models
│   └── migrations/               # All migration files (never skip these)
│
├── types/
│   └── index.ts                  # Shared TypeScript types
│
├── .env.local                    # Environment variables (never commit)
└── .env.example                  # Template for env vars
```

---

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL=""

# NextAuth
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Anthropic
ANTHROPIC_API_KEY=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

---

## Routes

| Route | Page | Auth |
|---|---|---|
| `/` | Landing / redirect to dashboard | Public |
| `/login` | Login page | Public |
| `/register` | Register page | Public |
| `/dashboard` | All errors feed | Required |
| `/dashboard/errors/[id]` | Single error fallback page | Required |
| `/dashboard/settings` | User settings + billing | Required |
| `POST /api/errors` | Create error entry | Required |
| `PUT /api/errors/[id]` | Update error entry | Required |
| `DELETE /api/errors/[id]` | Delete error entry | Required |
| `GET /api/errors` | List errors (personal + community) | Required |
| `POST /api/ai/tag` | Get AI tag suggestions | Pro |
| `POST /api/ai/suggest` | Get AI solution suggestion | Pro |
| `POST /api/stripe/webhook` | Handle Stripe events | Stripe only |

---

## Monetization

### Free Tier
- Unlimited personal error entries
- Manual tags only
- Full-text search of own entries
- Filter by tag and status
- Entries always private
- No AI features
- No community access

### Pro — $8/month or $72/year
- Everything in Free
- AI auto-tagging on every save
- AI solution suggestions
- Community database — search other pro users' public errors
- Mark own entries as public (contribute to community)
- Priority support

### How Pro is gated
```
user.isPro === true  →  unlock AI endpoints + community search
```
Stripe webhook listens for `checkout.session.completed` and `customer.subscription.deleted` and flips `isPro` on the User accordingly.

> **During development**: Pro gate is implemented but not enforced — all features available to all users.

---

## UI / UX

### Design References
- [Linear](https://linear.app) — clean list UI, keyboard-first
- [Raycast](https://raycast.com) — fast access, minimal chrome
- [Notion](https://notion.so) — markdown editing feel

### Layout

```
┌──────────────────────────────────────────────────┐
│  HEADER — Logo + Search bar + User avatar        │
├─────────────┬────────────────────────────────────┤
│  SIDEBAR    │  MAIN CONTENT                      │
│             │                                    │
│  All        │  ┌────────────────────────────┐    │
│  Solved     │  │ TypeError: Cannot read...  │    │
│  Unsolved   │  │ #react #hooks  ● unsolved  │    │
│  Favorites  │  └────────────────────────────┘    │
│             │  ┌────────────────────────────┐    │
│  TAGS       │  │ Prisma migration failed    │    │
│  #react (4) │  │ #prisma #postgres  ✓ solved│    │
│  #prisma(2) │  └────────────────────────────┘    │
│  #next  (3) │                                    │
│             │                                    │
└─────────────┴────────────────────────────────────┘
```

### Entry Drawer (opens on click)

```
┌─────────────────────────────────────────┐
│  TypeError: Cannot read property of...  │
│  ● Unsolved  ·  June 10, 2025  ·  ☆    │
├─────────────────────────────────────────┤
│  DESCRIPTION                            │
│  Was building a React hook, tried...    │
├─────────────────────────────────────────┤
│  STACK TRACE                            │
│  ┌─────────────────────────────────┐   │
│  │ TypeError: Cannot read prop...  │   │
│  │   at Component (App.jsx:42)     │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  SOLUTION                               │
│  Added optional chaining (?.) to...    │
├─────────────────────────────────────────┤
│  TAGS                                   │
│  [react] [hooks] [+ Add tag]            │
│                                         │
│  ✨ AI Suggestions: [typescript] [null] │
├─────────────────────────────────────────┤
│  💡 AI SOLUTION SUGGESTION              │
│  This looks like a null reference...   │
└─────────────────────────────────────────┘
```

### Colors & Icons

| Element | Color | Icon (Lucide) |
|---|---|---|
| Solved status | `#10b981` emerald | `CheckCircle` |
| Unsolved status | `#f97316` orange | `AlertCircle` |
| AI-generated tag | `#8b5cf6` purple | `Sparkles` |
| Custom tag | `#3b82f6` blue | `Tag` |
| Favorite | `#fde047` yellow | `Star` |
| Pinned | `#6b7280` gray | `Pin` |
| Public (pro) | `#10b981` emerald | `Globe` |
| Private | `#6b7280` gray | `Lock` |

### Micro-interactions
- Smooth drawer open/close (slide in from right)
- Hover states on list rows
- Toast notifications for save, delete, tag actions
- Loading skeletons while fetching entries
- Optimistic UI — list updates immediately before server confirms

---

## Future Scope *(Out of v1)*

- [ ] Team workspaces with shared private error collections
- [ ] Browser extension to capture errors directly from DevTools console
- [ ] Slack / Discord bot integration — log errors from chat
- [ ] Public profile pages for pro contributors
- [ ] Voting / upvoting community solutions
- [ ] Weekly digest email — "errors like yours were solved this week"
