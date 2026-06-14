# Current Feature

Dashboard UI Phase 3 — main content area with error list

## Status

Completed

## Goals

- Label of selected category above the error list showing entry count
- Sorter control on the right side of the header
- Error list items displaying: tags, solved/unsolved status, date of creation, pin icon (yellow if pinned), star icon (favorite), community vs self-created icon
- Use mock data from `src/lib/mock-data.js` directly (no database yet)

## Notes

- Reference screenshot: `context/screenshots/dashboard-ui-main.png`
- Phase 1 spec: `context/features/dashboard-phase-1-spec.md`
- Phase 2 spec: `context/features/dashboard-phase-2-spec.md`

## History

- **2026-06-11** — Initial Next.js 16 + Tailwind CSS v4 setup with React 19 and TypeScript (commits `b555e9a`, `5490fb8`)
- **2026-06-13** — Dashboard UI Phase 1: ShadCN UI (base-nova) initialized, Button and Input components installed, `/dashboard` route created with dark-mode layout, top bar with search and New button, placeholder Sidebar and Main areas
- **2026-06-14** — Dashboard UI Phase 2: collapsible sidebar with Categories (All Errors, Solved, Unsolved, Favorites, Pinned) and Tags sections, both independently collapsible, New Entry button, user avatar at bottom, mobile drawer overlay, Geist Sans wired as primary font (commit `7aa6d75`)
- **2026-06-14** — Dashboard UI Phase 3: main content area with category label + entry count, newest/oldest sorter, error list with tag pills, solved/unsolved status, date, pin/star/community icons; sidebar category clicks filter the list via shared React context
