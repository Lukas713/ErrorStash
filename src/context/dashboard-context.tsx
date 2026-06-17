'use client'

import { createContext, useContext, useState } from 'react'
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
  entries: ErrorEntryWithTags[]
  user: DashboardUser | null
  tags: TagWithCount[]
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
  return (
    <DashboardContext.Provider value={{ activeCategory, setActiveCategory, entries: initialEntries, user, tags: initialTags }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider')
  return ctx
}
