'use client'

import { createContext, useContext, useState } from 'react'

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
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  return (
    <DashboardContext.Provider value={{ activeCategory, setActiveCategory }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider')
  return ctx
}
