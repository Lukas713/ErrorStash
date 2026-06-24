'use client'

import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { useDashboard, CATEGORY_LABELS } from '@/context/dashboard-context'
import ErrorCard from './ErrorCard'
import { ErrorEntryDrawer } from './ErrorEntryDrawer'

type SortOption = 'newest' | 'oldest'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
]

export default function ErrorList() {
  const { activeCategory, activeTags, toggleTag, entries, setSelectedEntryId } = useDashboard()
  const [sort, setSort] = useState<SortOption>('newest')
  const [sortOpen, setSortOpen] = useState(false)

  const filtered = entries.filter(entry => {
    const categoryMatch = (() => {
      switch (activeCategory) {
        case 'solved':    return entry.status === 'SOLVED'
        case 'unsolved':  return entry.status === 'UNSOLVED'
        case 'favorites': return entry.isFavorite
        case 'pinned':    return entry.isPinned
        default:          return true
      }
    })()
    const tagMatch = activeTags.length === 0 || activeTags.every(t => entry.tags.some(et => et.name === t))
    return categoryMatch && tagMatch
  })

  const sorted = [...filtered].sort((a, b) => {
    const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return sort === 'newest' ? diff : -diff
  })

  return (
    <>
    <ErrorEntryDrawer />
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            {CATEGORY_LABELS[activeCategory]}
          </h2>
          <span className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          </span>
          {activeTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/20"
            >
              #{tag}
              <X className="size-3" />
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(prev => !prev)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {SORT_OPTIONS.find(o => o.value === sort)?.label}
            <ChevronDown className="size-3" />
          </button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 min-w-24 rounded-md border border-border bg-popover py-1 shadow-md">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => { setSort(option.value); setSortOpen(false) }}
                    className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No entries found.</p>
        ) : (
          sorted.map(entry => (
            <ErrorCard
              key={entry.id}
              entry={entry}
              onClick={() => setSelectedEntryId(entry.id)}
            />
          ))
        )}
      </div>
    </div>
    </>
  )
}
