'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { ErrorEntryWithTags, DashboardUser } from '@/lib/db/errors'
import type { TagWithCount } from '@/lib/db/error-tags'

export type Category = 'all' | 'solved' | 'unsolved' | 'favorites' | 'pinned'

export const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All Errors',
  solved: 'Solved',
  unsolved: 'Unsolved',
  favorites: 'Favorites',
  pinned: 'Pinned',
}

interface DashboardContextValue {
  activeCategory: Category
  setActiveCategory: (c: Category) => void
  activeTags: string[]
  toggleTag: (tag: string) => void
  entries: ErrorEntryWithTags[]
  updateEntry: (id: string, patch: Partial<Pick<ErrorEntryWithTags, 'isFavorite' | 'isPinned' | 'status' | 'isPublic'>>) => void
  removeEntry: (id: string) => void
  user: DashboardUser | null
  tags: TagWithCount[]
  newEntryOpen: boolean
  setNewEntryOpen: (open: boolean) => void
  selectedEntryId: string | null
  setSelectedEntryId: (id: string | null) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({
  children,
  initialEntries,
  initialTags,
  user,
}: {
  children: React.ReactNode
  initialEntries: ErrorEntryWithTags[]
  initialTags: TagWithCount[]
  user: DashboardUser | null
}) {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [newEntryOpen, setNewEntryOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [entries, setEntries] = useState(initialEntries)

  useEffect(() => { setEntries(initialEntries) }, [initialEntries])

  function toggleTag(tag: string) {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  function updateEntry(id: string, patch: Partial<Pick<ErrorEntryWithTags, 'isFavorite' | 'isPinned' | 'status' | 'isPublic'>>) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
  }

  function removeEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <DashboardContext.Provider value={{
      activeCategory, setActiveCategory,
      activeTags, toggleTag,
      entries, updateEntry, removeEntry,
      user, tags: initialTags,
      newEntryOpen, setNewEntryOpen,
      selectedEntryId, setSelectedEntryId,
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider')
  return ctx
}
