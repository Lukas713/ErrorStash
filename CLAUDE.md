# CLAUDE.md

Developers hub where development or production errors are stored. Also all errors are searchable and categorized by the service or language or some other keyword.

@AGENTS.md

## Context files

Read the following to get the full context of the project:
- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

```bash
npm run dev        # start dev server on http://localhost:3000
npm run build      # production build
npm run start      # serve production build
npm run lint       # run ESLint
npm test           # run unit tests (Vitest) once
npm run test:watch # run unit tests in watch mode
```

Unit tests use **Vitest** and cover **server actions (`src/actions/`) and utilities (`src/lib/`) only** — not components. Test files are co-located as `*.test.ts`. See `context/ai-interaction.md` for the testing workflow.

## Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** — configured via `postcss.config.mjs`; imported in `src/app/globals.css` with `@import "tailwindcss"`
- Fonts: Geist Sans and Geist Mono loaded via `next/font/google` in `layout.tsx`

## Project structure

```
src/app/
  layout.tsx    # root layout — sets fonts, metadata, body wrapper
  page.tsx      # / route
  globals.css   # global styles (Tailwind import only)
public/         # static assets served at /
```

All routes live under `src/app/`. New pages are added as `src/app/<segment>/page.tsx`.

## Neon MCP

- Project: **ErrorStash** (`mute-bar-00478975`)
- Default branch: **development** (`br-quiet-waterfall-asdwzgsw`)
- **Never query or modify the production branch** (`br-bold-field-askwnb9i`) unless explicitly told to
