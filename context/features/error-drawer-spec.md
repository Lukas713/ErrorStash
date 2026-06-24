# Item Drawer

## Overview

Right-side slide-in drawer that opens when clicking an error card. This is the error detail view — there is no separate error page.

## Requirements

- Use shadcn Sheet component, opens from the right
- Clicking an ErrorCard opens the drawer with that error's full data
- Action bar with Favorite (star icon, yellow when active), Pin, Copy, Edit (pencil icon), and Delete (trash icon, right-aligned, if error is created by current user. If error is created by someone else, delete is not visible)
- The extras like the code editor and item-specific stuff will come later. For now, let's just work on the drawer details display.
- Client wrapper component to manage drawer state since pages are server components
- Should feel snappy — fetch on click, no page navigation

## Data Fetching

- Card data (title, description, tags, etc.) is fetched by the server component as before
- Full error detail is fetched on click via API route (`/api/errors/[id]`)
- Query function lives in `lib/db/errors.ts`, API route calls it with auth check
- Drawer shows a skeleton/loading state while fetching

## Reference

See `context/screenshots/dashboard-ui-drawer-open-error.png` (right side) for the visual design.
