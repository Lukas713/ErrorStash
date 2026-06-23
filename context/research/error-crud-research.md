# Item CRUD Architecture

## Output

`docs/error-crud-architecture.md`

## Research

Design a unified CRUD system for error entries:
- Mutations (create, update, delete) in one action file
- Data fetching in lib/db (called directly from server components)
- One dynamic route, shared components that adapt by type

## Include

- File structure (actions for mutations, lib/db for queries, routes, components)
- How `/errors/` routing works
- Where errors logic lives (components, not actions)
- Component responsibilities

## Sources

- @context/project-overview.md
- @docs/content-types.md
- @prisma/schema.prisma
- @src/lib/constants.tsx
