# Item Create

## Overview

Add new error entry via a modal dialog. Opens from "New Entry" button in top bar.

## Requirements

- Use shadcn Dialog component
- Fields shown:
  - title (required), status, description, stack trace, solution, tags
- Server action `createError` with Zod validation
- Query function `createError` in `lib/db/errors.ts`
- Toast on success, close modal and refresh

## References

- @context/screenshots/dashboard-ui-drawer-new-entry.png
- @context/project-overview.md
- @src/lib/mock-data.ts