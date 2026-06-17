# Dashboard Tasgs Spec

## Overview

Replace the dummy errors tags data displayed in the sidebar area of the dashboard (left side), with actual data from the database. It should look how it does now with the list of used tags, but instead of using data from @src/lib/mock-data.ts, it should be from our Neon database using Prisma. Do not forget that pro version customer needs to have all tags displayed and non pro version customer only tags that he used for he's account.

## Requirements

- Create src/lib/db/error-tags.ts with data fetching functions
- Fetch error-tags directly in server component
- Keep the current design. You can also reference the screenshot
- Update number of errors that reference tag on the right of the error tag

## References

Check the `@context/screenshots/dashboard-ui-drawer-entry.png` screenshot if needed.