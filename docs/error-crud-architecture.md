# Error Entry CRUD Architecture

Design reference for the unified create/read/update/delete system for `ErrorEntry` records.

---

## Guiding Principles

- **Mutations live in actions** (`src/actions/errors.ts`) — one file for all error entry writes
- **Reads live in lib/db** (`src/lib/db/errors.ts`) — called directly from server components, never from actions
- **Business logic stays in components** — actions validate input and call Prisma; components own the UX flow (open drawer, show toast, refresh)
- **One dynamic route** (`/dashboard/errors/[id]`) as a fallback page for direct links; the primary UX is the drawer

---

## File Structure

```
src/
├── actions/
│   └── errors.ts                        # all error entry mutations
│
├── lib/
│   └── db/
│       ├── errors.ts                    # getErrorEntries(), getErrorEntry(id), getCurrentUser()
│       └── error-tags.ts               # getTagsWithCounts()
│
├── app/
│   └── dashboard/
│       ├── layout.tsx                   # fetches entries + tags, wraps with DashboardShell
│       ├── page.tsx                     # renders <ErrorList />
│       └── errors/
│           └── [id]/
│               └── page.tsx            # fallback full-page view for direct URL access
│
└── components/
    └── errors/
        ├── ErrorList.tsx               # filter/sort feed from context, renders ErrorCards
        ├── ErrorCard.tsx               # list item; click opens drawer
        ├── ErrorDrawer.tsx             # slide-in panel; hosts full detail + ErrorForm
        └── ErrorForm.tsx               # create / edit form (adapts via mode prop)
```

---

## Action File: `src/actions/errors.ts`

All functions follow the same pattern: `"use server"` directive, auth guard via `auth()`, input validation, Prisma mutation, return `{ error?: string }` or `{ error?: string; id?: string }`.

```ts
"use server"

export async function createErrorAction(formData: FormData): Promise<{ error?: string; id?: string }>
export async function updateErrorAction(id: string, formData: FormData): Promise<{ error?: string }>
export async function deleteErrorAction(id: string): Promise<{ error?: string }>
export async function toggleFavoriteAction(id: string, current: boolean): Promise<{ error?: string }>
export async function togglePinnedAction(id: string, current: boolean): Promise<{ error?: string }>
export async function togglePublicAction(id: string, current: boolean): Promise<{ error?: string }>
```

### Tag Handling Inside Actions

Tags are managed as part of `createErrorAction` and `updateErrorAction` — not in a separate action call.

On each save:
1. Accept `tags` as a comma-separated string from the form
2. For each tag name: `upsert` a `Tag` record (`@@unique([name, userId])` prevents duplicates)
3. Sync the `ErrorTag` join table: delete rows not in the new list, create rows for new additions

On delete: Prisma cascade (`onDelete: Cascade` on `ErrorTag`) cleans up join rows automatically.

---

## Query File: `src/lib/db/errors.ts`

Extend with a single-entry fetch:

```ts
export async function getErrorEntry(id: string): Promise<ErrorEntryWithTags | null>
```

This is used exclusively by the fallback page (`/dashboard/errors/[id]/page.tsx`). The drawer reads the entry from `DashboardContext` (already in memory from the list fetch), so it needs no extra DB call.

---

## Routing

### Primary UX — Drawer

Entry detail and editing happen in `ErrorDrawer`, which slides in from the right over the dashboard. Opening the drawer is a client-side state change — no navigation, no page reload.

### Fallback Page — `/dashboard/errors/[id]`

Used when a user navigates directly to an entry URL (e.g., from a shared link). The page fetches the entry server-side with `getErrorEntry(id)` and renders the same detail view as the drawer, but as a full page inside the dashboard layout.

```
/dashboard/errors/[id]/page.tsx
  → calls getErrorEntry(id)
  → renders <ErrorDrawer entry={entry} mode="page" /> (or equivalent full-page variant)
```

---

## Data Flow

### List View

```
DashboardLayout (server)
  → getErrorEntries()  +  getTagsWithCounts()   [parallel]
  → DashboardShell (client boundary)
      → DashboardContext.Provider  [entries, tags, user]
          → Sidebar   (reads tags from context)
          → ErrorList (reads entries from context, filter/sort in-memory)
              → ErrorCard × N
```

### Opening the Drawer

```
ErrorCard click
  → setOpenEntryId(id) in DashboardContext (or local state in ErrorList)
  → ErrorDrawer renders with entry = entries.find(e => e.id === id)
  → No DB call needed — entry is already in context
```

### After a Mutation

```
createErrorAction / updateErrorAction / deleteErrorAction
  → returns { error? }
  → on success: router.refresh()   ← re-runs DashboardLayout server component
  → DashboardContext re-populated with fresh data
  → ErrorList re-renders with updated entries
```

---

## Component Responsibilities

| Component | Responsibility |
|---|---|
| `ErrorList` | Filter entries from context by category + active tags; sort by date; render `ErrorCard` list; show entry count and active tag chips |
| `ErrorCard` | Display entry summary (title, tags, status badge, date, pin/star/public icons); trigger drawer open on click |
| `ErrorDrawer` | Slide-in panel (right); show full entry detail; toggle between view and edit mode; contain `ErrorForm` for editing; handle delete with confirmation |
| `ErrorForm` | Shared create/edit form; adapts via `mode: 'create' | 'edit'` prop; calls `createErrorAction` or `updateErrorAction`; shows AI tag suggestions after save (Pro) |

---

## ErrorForm Modes

`ErrorForm` is a single component used in two places:
- **Create mode**: rendered inside `ErrorDrawer` when the user clicks "New Entry" — `id` prop absent, calls `createErrorAction`
- **Edit mode**: rendered inside `ErrorDrawer` when the user clicks "Edit" on an existing entry — `entry` prop present, calls `updateErrorAction(entry.id, formData)`

The form fields map directly to `ErrorEntry`:

| Field | Input type | Notes |
|---|---|---|
| `title` | `<input>` | Required |
| `description` | Markdown textarea | Optional |
| `stackTrace` | `<textarea>` monospace | Optional |
| `solution` | Markdown textarea | Optional; only relevant when status is SOLVED |
| `status` | Toggle / select | SOLVED / UNSOLVED |
| `tags` | Tag input (comma-separated or pill UI) | Synced on save |
| `isPublic` | Checkbox | Pro only |

---

## AI Integration

AI features are triggered client-side after save, not inside the action:

1. `ErrorForm` calls `createErrorAction` / `updateErrorAction` and gets back the `id`
2. Client then calls `POST /api/ai/tag` with `{ title, description, stackTrace }` (if user is Pro)
3. Response returns suggested tag names; `ErrorForm` renders them as accept/reject pills
4. Accepted tags trigger a separate `updateErrorAction` call to sync the tag list

This keeps the Server Action fast (no AI latency on the critical save path) and the AI result optional and asynchronous.

---

## Auth Guard Pattern

Every action checks the session before touching the DB. Ownership is always validated before update/delete:

```ts
const session = await auth()
if (!session?.user?.id) return { error: "Unauthorized" }

const entry = await prisma.errorEntry.findUnique({ where: { id }, select: { userId: true } })
if (!entry || entry.userId !== session.user.id) return { error: "Not found" }
```
