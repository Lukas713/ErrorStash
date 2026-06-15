'use client'

import { createContext, useContext, useState } from 'react'
import type { ErrorEntryWithTags, DashboardUser } from '@/lib/db/errors'

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
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({
  children,
  initialEntries,
  user,
}: {
  children: React.ReactNode
  initialEntries: ErrorEntryWithTags[]
  user: DashboardUser | null
}) {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  return (
    <DashboardContext.Provider value={{ activeCategory, setActiveCategory, entries: initialEntries, user }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider')
  return ctx
}
