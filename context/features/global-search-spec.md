# Global Search / Command Palette

## Overview

Add a global command palette (Cmd+K / Ctrl+K) with fuzzy search across error entries.

## Requirements

- Open with Cmd+K (Mac) / Ctrl+K (Windows)
- Fuzzy search across all error entries
- Grouped results: error entry section, tags section
- Keyboard navigation (arrow keys, Enter to select)
- Navigate to error entry drawer on select
- TopBar search input opens palette on click
- Show ⌘K hint in search input placeholder

## Technical

- Use shadcn `cmdk` component (Command)
- Client-side fuzzy search (no server round-trips)
- Pre-fetch searchable data on app load
- Search data: error entry (title, tag, visibility, solution)
- Reuse existing data fetching functions
