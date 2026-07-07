'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Globe, Hash, Lock } from 'lucide-react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useDashboard } from '@/context/dashboard-context'
import { paletteFilter } from '@/lib/search'

export function CommandPalette() {
  const {
    entries,
    tags,
    commandOpen,
    setCommandOpen,
    setSelectedEntryId,
    toggleTag,
    activeTags,
  } = useDashboard()
  const [search, setSearch] = useState('')

  // Global Cmd+K / Ctrl+K to toggle the palette.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen(!commandOpen)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [commandOpen, setCommandOpen])

  function handleOpenChange(open: boolean) {
    setCommandOpen(open)
    if (!open) setSearch('')
  }

  function selectEntry(id: string) {
    setSelectedEntryId(id)
    handleOpenChange(false)
  }

  function selectTag(name: string) {
    if (!activeTags.includes(name)) toggleTag(name)
    handleOpenChange(false)
  }

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={handleOpenChange}
      title="Search errors"
      description="Search error entries and tags"
    >
      <Command filter={paletteFilter}>
        <CommandInput
          placeholder="Search errors by title, tag, or solution..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {entries.length > 0 && (
          <CommandGroup heading="Error Entries">
            {entries.map(entry => (
              <CommandItem
                key={entry.id}
                // The value drives cmdk's built-in fuzzy filtering; include every
                // searchable field so a match on title, tag, visibility, or
                // solution surfaces the entry.
                value={[
                  entry.title,
                  entry.tags.map(t => t.name).join(' '),
                  entry.isPublic ? 'public community' : 'private',
                  entry.solution ?? '',
                  entry.id,
                ].join(' ')}
                onSelect={() => selectEntry(entry.id)}
              >
                {entry.status === 'SOLVED' ? (
                  <CheckCircle className="text-emerald-500" />
                ) : (
                  <AlertCircle className="text-orange-500" />
                )}
                <span className="flex-1 truncate">{entry.title}</span>
                {entry.isPublic ? (
                  <Globe className="size-3.5 text-emerald-500" />
                ) : (
                  <Lock className="size-3.5 text-muted-foreground" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {tags.length > 0 && (
          <CommandGroup heading="Tags">
            {tags.map(tag => (
              <CommandItem
                key={tag.id}
                value={`tag ${tag.name}`}
                onSelect={() => selectTag(tag.name)}
              >
                <Hash className="text-blue-500" />
                <span className="flex-1 truncate">{tag.name}</span>
                <span className="text-xs text-muted-foreground">{tag.count}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
