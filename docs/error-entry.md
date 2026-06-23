# Error Entry

The core data object in ErrorStash. Each entry represents a single developer error — what it was, how it manifested, and how it was fixed.

---

## Model: `ErrorEntry`

Defined in [prisma/schema.prisma](../prisma/schema.prisma). The TypeScript shape used across the app is `ErrorEntryWithTags` from [src/lib/db/errors.ts](../src/lib/db/errors.ts).

### Properties

| Field | Type | Default | Purpose |
|---|---|---|---|
| `id` | `String` (cuid) | auto | Unique identifier |
| `title` | `String` | required | Short name for the error — the primary search target |
| `description` | `String?` | null | What the developer was doing and what they tried. Markdown supported. |
| `stackTrace` | `String?` | null | Raw error output. Displayed in a monospaced code block. |
| `solution` | `String?` | null | How the error was fixed. Markdown supported. Null when status is `UNSOLVED`. |
| `status` | `Status` enum | `UNSOLVED` | `SOLVED` or `UNSOLVED` — drives sidebar filters and entry badge color |
| `isPublic` | `Boolean` | `false` | Pro feature: exposes the entry to the community search index |
| `isFavorite` | `Boolean` | `false` | User-starred — appears in the Favorites sidebar filter |
| `isPinned` | `Boolean` | `false` | Pinned entries appear at the top of the list |
| `createdAt` | `DateTime` | auto | Creation timestamp |
| `updatedAt` | `DateTime` | auto-updated | Last modified timestamp |
| `userId` | `String` | required | Owner — FK to `User`, cascades on delete |
| `tags` | `ErrorTag[]` | relation | Many-to-many join to `Tag` via `ErrorTag` |

### Status Enum

```
UNSOLVED  — problem not yet fixed (orange badge, AlertCircle icon)
SOLVED    — fix documented in the solution field (emerald badge, CheckCircle icon)
```

### Indexes

| Index | Fields | Purpose |
|---|---|---|
| `@@index([userId])` | userId | All entries for a user |
| `@@index([userId, status])` | userId + status | Solved/Unsolved sidebar filters |
| `@@index([userId, isFavorite])` | userId + isFavorite | Favorites filter |
| `@@index([userId, isPinned])` | userId + isPinned | Pinned filter |
| `@@index([createdAt])` | createdAt | Newest/oldest sort |

---

## Related Models

### `Tag`
User-scoped tag. Name is unique per user (`@@unique([name, userId])`). Tags can be AI-generated (purple) or manually added (blue).

### `ErrorTag`
Join table between `ErrorEntry` and `Tag`. Composite PK `[errorEntryId, tagId]`. Stores `addedAt` timestamp. Cascades on delete of either parent.

---

## TypeScript Shape (`ErrorEntryWithTags`)

Used when fetching entries for the dashboard. `createdAt` is serialized to an ISO string for client component compatibility.

```typescript
type ErrorEntryWithTags = {
  id: string
  title: string
  description: string | null
  stackTrace: string | null
  solution: string | null
  status: 'SOLVED' | 'UNSOLVED'
  isPublic: boolean
  isFavorite: boolean
  isPinned: boolean
  createdAt: string           // ISO 8601
  tags: { id: string; name: string }[]
}
```

---

## Seed Entries

Eight representative entries defined in [prisma/seed.ts](../prisma/seed.ts). All belong to the demo user `demo@errorstash.io`.

| # | Title | Status | Favorite | Pinned | Tags |
|---|---|---|---|---|---|
| 1 | TypeError: Cannot read properties of undefined (reading 'map') | SOLVED | yes | yes | react, hooks, typescript |
| 2 | Prisma migration failed — column already exists in table | SOLVED | no | no | prisma, postgresql, database |
| 3 | Next.js hydration mismatch — server and client rendered different HTML | UNSOLVED | no | no | nextjs, react, ssr |
| 4 | Docker container exits immediately with code 0 | SOLVED | yes | no | docker, devops |
| 5 | TypeScript: Property 'data' does not exist on type 'ApiResponse' | SOLVED | no | no | typescript, api |
| 6 | CORS error when calling internal API route from client component | UNSOLVED | no | no | cors, api, nextjs |
| 7 | Tailwind CSS utility classes not applying after production build | SOLVED | no | no | tailwind, css, nextjs |
| 8 | npm install fails — EACCES permission denied on global package | SOLVED | no | yes | npm, nodejs |

### Summary
- **8 entries** total: 6 SOLVED, 2 UNSOLVED
- **2 favorited**, **2 pinned**, **0 public**
- **17 tags** seeded: react, hooks, typescript, nextjs, prisma, postgresql, database, docker, devops, css, tailwind, api, cors, nodejs, npm, git, ssr
- All entries have title, description, and stackTrace filled; solution is `null` on UNSOLVED entries
