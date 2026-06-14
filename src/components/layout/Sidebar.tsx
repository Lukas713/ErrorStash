'use client'

import { useState } from "react"
import { PanelLeft, Plus, CheckCircle, AlertCircle, Star, Tag, LayoutList, ChevronDown, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MOCK_ERROR_ENTRIES, MOCK_TAGS, MOCK_USER } from "@/lib/mock-data"
import { useDashboard, type Category } from "@/context/dashboard-context"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [tagsOpen, setTagsOpen] = useState(true)
  const { activeCategory, setActiveCategory } = useDashboard()

  const allCount = MOCK_ERROR_ENTRIES.length
  const solvedCount = MOCK_ERROR_ENTRIES.filter(e => e.status === "SOLVED").length
  const unsolvedCount = MOCK_ERROR_ENTRIES.filter(e => e.status === "UNSOLVED").length
  const favoritesCount = MOCK_ERROR_ENTRIES.filter(e => e.isFavorite).length
  const pinnedCount = MOCK_ERROR_ENTRIES.filter(e => e.isPinned).length

  const tagCounts = MOCK_ERROR_ENTRIES.reduce<Record<string, number>>((acc, entry) => {
    entry.tags.forEach(tag => {
      acc[tag.id] = (acc[tag.id] ?? 0) + 1
    })
    return acc
  }, {})

  const tagsWithCounts = MOCK_TAGS
    .filter(tag => tagCounts[tag.id])
    .map(tag => ({ ...tag, count: tagCounts[tag.id] }))
    .sort((a, b) => b.count - a.count)

  const userInitials = MOCK_USER.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
          // Mobile: fixed drawer, always full width
          "fixed inset-y-0 left-0 z-50 w-56",
          // Desktop: in-flow
          "md:relative md:inset-auto md:z-auto",
          // Mobile open/close via translate
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible, translate reset, width toggles
          "md:translate-x-0",
          isOpen ? "md:w-56" : "md:w-10 md:overflow-hidden",
        )}
      >
        {/* Header: toggle + new entry button */}
        <div
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b border-sidebar-border px-2",
            !isOpen && "md:justify-center md:px-0",
          )}
        >
          <button
            onClick={onToggle}
            className="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-sidebar-accent"
          >
            <PanelLeft className="size-4" />
          </button>
          {isOpen && (
            <Button size="sm" className="h-7 flex-1 gap-1 text-xs">
              <Plus className="size-3.5" />
              New Entry
            </Button>
          )}
        </div>

        {/* Scrollable nav */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-2">
          {isOpen && (
            <>
              {/* Categories */}
              <section>
                <button
                  onClick={() => setCategoriesOpen(prev => !prev)}
                  className="mb-1 flex w-full items-center gap-1 px-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50 hover:text-sidebar-foreground"
                >
                  <span className="flex-1 text-left">Categories</span>
                  <ChevronDown className={cn("size-3 transition-transform", !categoriesOpen && "-rotate-90")} />
                </button>
                {categoriesOpen && (
                  <nav className="flex flex-col gap-0.5">
                    <NavItem icon={<LayoutList className="size-4" />} label="All Errors" count={allCount} active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
                    <NavItem icon={<CheckCircle className="size-4" />} label="Solved" count={solvedCount} active={activeCategory === 'solved'} onClick={() => setActiveCategory('solved')} />
                    <NavItem icon={<AlertCircle className="size-4" />} label="Unsolved" count={unsolvedCount} active={activeCategory === 'unsolved'} onClick={() => setActiveCategory('unsolved')} />
                    <NavItem icon={<Star className="size-4" />} label="Favorites" count={favoritesCount} active={activeCategory === 'favorites'} onClick={() => setActiveCategory('favorites')} />
                    <NavItem icon={<Pin className="size-4" />} label="Pinned" count={pinnedCount} active={activeCategory === 'pinned'} onClick={() => setActiveCategory('pinned')} />
                  </nav>
                )}
              </section>

              {/* Tags */}
              <section>
                <button
                  onClick={() => setTagsOpen(prev => !prev)}
                  className="mb-1 flex w-full items-center gap-1 px-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50 hover:text-sidebar-foreground"
                >
                  <span className="flex-1 text-left">Tags</span>
                  <ChevronDown className={cn("size-3 transition-transform", !tagsOpen && "-rotate-90")} />
                </button>
                {tagsOpen && (
                  <nav className="flex flex-col gap-0.5">
                    {tagsWithCounts.map(tag => (
                      <NavItem
                        key={tag.id}
                        icon={<Tag className="size-3.5" />}
                        label={tag.name}
                        count={tag.count}
                      />
                    ))}
                  </nav>
                )}
              </section>
            </>
          )}
        </div>

        {/* User avatar */}
        <div
          className={cn(
            "flex shrink-0 items-center gap-2 border-t border-sidebar-border p-2",
            !isOpen && "md:justify-center md:p-1",
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {userInitials}
          </div>
          {isOpen && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{MOCK_USER.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/50">{MOCK_USER.email}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

function NavItem({
  icon,
  label,
  count,
  active = false,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  count: number
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
      )}
    >
      {icon}
      <span className="flex-1 truncate text-left">{label}</span>
      <span className="tabular-nums text-xs text-sidebar-foreground/50">{count}</span>
    </button>
  )
}
