# Seed Data Specification

## Overview

Create a seed script (`prisma/seed.ts`) to populate the database with realistic developer error entries for development and demos.

## Requirements

### User

- **Email:** demo@errorstash.io
- **Name:** Demo Dev
- **isPro:** false
- **emailVerified:** current date

No password field — auth is handled by NextAuth (OAuth / credentials adapter).

---

### Tags

All tags belong to the demo user.

| Name        |
| ----------- |
| react       |
| hooks       |
| typescript  |
| nextjs      |
| prisma      |
| postgresql  |
| database    |
| docker      |
| devops      |
| css         |
| tailwind    |
| api         |
| cors        |
| nodejs      |
| npm         |
| git         |
| ssr         |

---

### Error Entries

All entries belong to the demo user. Mix of SOLVED / UNSOLVED, some pinned, some favorited.

#### 1. TypeError: Cannot read properties of undefined (reading 'map')

- **Status:** SOLVED
- **isFavorite:** true
- **isPinned:** true
- **Tags:** react, hooks, typescript
- **Description:** Building a custom hook that returns a list of items. Called `.map()` on the return value before the data had loaded, causing a crash on first render.
- **Stack Trace:**
  ```
  TypeError: Cannot read properties of undefined (reading 'map')
      at ItemList (src/components/ItemList.tsx:18:22)
      at renderWithHooks (react-dom.development.js:14985)
      at mountIndeterminateComponent (react-dom.development.js:17811)
  ```
- **Solution:** Added a default value of `[]` to the hook's return and used optional chaining (`items?.map(...)`) at the call site. Also added a loading state guard before rendering.

---

#### 2. Prisma migration failed — column already exists in table

- **Status:** SOLVED
- **isFavorite:** false
- **isPinned:** false
- **Tags:** prisma, postgresql, database
- **Description:** Ran `prisma migrate dev` after adding a new field to the schema. Migration failed because a previous `db push` had already added the column directly without a migration file.
- **Stack Trace:**
  ```
  Error: P3006

  Migration `20260610120000_add_status_field` failed to apply cleanly to the shadow database.
  Error code: 42701
  ERROR: column "status" of relation "ErrorEntry" already exists
  ```
- **Solution:** Resolved by creating a manual baseline migration. Ran `prisma migrate resolve --applied 20260610120000_add_status_field` to mark the migration as already applied, then continued with `prisma migrate dev`.

---

#### 3. Next.js hydration mismatch — server and client rendered different HTML

- **Status:** UNSOLVED
- **isFavorite:** false
- **isPinned:** false
- **Tags:** nextjs, react, ssr
- **Description:** A component conditionally renders content based on `window.innerWidth`. Works fine in dev, but throws a hydration warning in the console and causes a layout flash on first load.
- **Stack Trace:**
  ```
  Warning: Prop `className` did not match.
   Server: "hidden"
   Client: "block"
      at Sidebar
      at DashboardLayout (src/app/(dashboard)/layout.tsx:12)
  ```
- **Solution:** null

---

#### 4. Docker container exits immediately with code 0

- **Status:** SOLVED
- **isFavorite:** true
- **isPinned:** false
- **Tags:** docker, devops
- **Description:** Built a Node.js Docker image and ran it with `docker run`. Container started and exited instantly with code 0 — no error, just silence.
- **Stack Trace:**
  ```
  $ docker run my-app
  (no output)
  $ docker ps -a
  CONTAINER ID   IMAGE     COMMAND       STATUS                    
  a1b2c3d4e5f6   my-app    "node ."      Exited (0) 2 seconds ago
  ```
- **Solution:** The Dockerfile was using `CMD ["node", "server.js"]` but `server.js` ran synchronously and returned immediately. Fixed by switching to an Express server that actually listens on a port, keeping the process alive.

---

#### 5. TypeScript: Property 'data' does not exist on type 'ApiResponse'

- **Status:** SOLVED
- **isFavorite:** false
- **isPinned:** false
- **Tags:** typescript, api
- **Description:** Defined a generic `ApiResponse<T>` type but destructured `.data` from it without the generic being passed, so TypeScript resolved it as `ApiResponse<unknown>` and couldn't guarantee `.data` existed.
- **Stack Trace:**
  ```
  src/lib/fetcher.ts:24:22 - error TS2339:
  Property 'data' does not exist on type 'ApiResponse<unknown>'

  24   const { data } = await fetchEntries();
  ```
- **Solution:** Updated the function signature to explicitly pass the generic: `fetchEntries<ErrorEntry[]>()`. Also added a return type annotation to the function so TypeScript could infer it everywhere it was called.

---

#### 6. CORS error when calling internal API route from client component

- **Status:** UNSOLVED
- **isFavorite:** false
- **isPinned:** false
- **Tags:** cors, api, nextjs
- **Description:** Making a `fetch('/api/errors')` call from a client component. Works locally but fails with a CORS error in preview deployments where the API and frontend are on different Vercel URLs.
- **Stack Trace:**
  ```
  Access to fetch at 'https://error-stash-git-feature-xyz.vercel.app/api/errors'
  from origin 'https://error-stash.vercel.app' has been blocked by CORS policy:
  No 'Access-Control-Allow-Origin' header is present on the requested resource.
  ```
- **Solution:** null

---

#### 7. Tailwind CSS utility classes not applying after production build

- **Status:** SOLVED
- **isFavorite:** false
- **isPinned:** false
- **Tags:** tailwind, css, nextjs
- **Description:** Custom color classes defined in `globals.css` under `@theme` worked in dev but disappeared after `npm run build`. The styles were simply missing from the compiled CSS.
- **Stack Trace:**
  ```
  (no runtime error — styles visually missing in production)
  ```
- **Solution:** The class names were being constructed dynamically with string concatenation (`"text-" + color`), which Tailwind's static scanner can't detect. Switched to a lookup map of complete class names so the scanner could include them in the output.

---

#### 8. npm install fails — EACCES permission denied on global package

- **Status:** SOLVED
- **isFavorite:** false
- **isPinned:** true
- **Tags:** npm, nodejs
- **Description:** Running `npm install -g prisma` on a new Linux dev machine failed with a permissions error. npm tried to write to `/usr/lib/node_modules` which is owned by root.
- **Stack Trace:**
  ```
  npm error code EACCES
  npm error syscall mkdir
  npm error path /usr/lib/node_modules/prisma
  npm error errno -13
  npm error Error: EACCES: permission denied, mkdir '/usr/lib/node_modules/prisma'
  ```
- **Solution:** Fixed by changing the npm global prefix to a user-owned directory: `npm config set prefix ~/.npm-global`, then adding `~/.npm-global/bin` to `PATH` in `.bashrc`. No more sudo needed for global installs.

---

## Seed Script Location

`prisma/seed.ts`

## Behavior

- Script is **idempotent** — safe to re-run; uses `upsert` for the user and tags, and clears then re-creates error entries on each run.
- Logs a summary to stdout on completion.
