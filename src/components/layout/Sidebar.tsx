'use client'

import { useState } from "react"
import { PanelLeft, Plus, CheckCircle, AlertCircle, Star, Tag, LayoutList, ChevronDown, Pin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useDashboard, type Category } from "@/context/dashboard-context"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const TAGS_INITIAL = 10
const TAGS_STEP = 5

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [tagsOpen, setTagsOpen] = useState(true)
  const [visibleTagCount, setVisibleTagCount] = useState(TAGS_INITIAL)
  const [tagSearch, setTagSearch] = useState('')
  const { activeCategory, setActiveCategory, activeTags, toggleTag, entries, user, tags } = useDashboard()

  const allCount = entries.length
  const solvedCount = entries.filter(e => e.status === "SOLVED").length
  const unsolvedCount = entries.filter(e => e.status === "UNSOLVED").length
  const favoritesCount = entries.filter(e => e.isFavorite).length
  const pinnedCount = entries.filter(e => e.isPinned).length

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
                    <div className="relative mb-1 px-0.5">
                      <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-sidebar-foreground/40" />
                      <input
                        type="text"
                        value={tagSearch}
                        onChange={e => { setTagSearch(e.target.value); setVisibleTagCount(TAGS_INITIAL) }}
                        placeholder="Search tags…"
                        className="h-6 w-full rounded bg-sidebar-accent pl-6 pr-2 text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:outline-none focus:ring-1 focus:ring-sidebar-border"
                      />
                    </div>
                    {tags
                      .filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
                      .slice(0, visibleTagCount)
                      .map(tag => (
                        <NavItem
                          key={tag.id}
                          icon={<Tag className="size-3.5" />}
                          label={tag.name}
                          count={tag.count}
                          active={activeTags.includes(tag.name)}
                          onClick={() => toggleTag(tag.name)}
                        />
                      ))}
                    {(() => {
                      const filtered = tags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
                      if (visibleTagCount < filtered.length) {
                        return (
                          <button
                            onClick={() => setVisibleTagCount(prev => prev + TAGS_STEP)}
                            className="mt-0.5 px-2 py-1.5 text-left text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
                          >
                            Load more ({filtered.length - visibleTagCount} remaining)
                          </button>
                        )
                      }
                      if (visibleTagCount > TAGS_INITIAL && filtered.length > TAGS_INITIAL) {
                        return (
                          <button
                            onClick={() => setVisibleTagCount(TAGS_INITIAL)}
                            className="mt-0.5 px-2 py-1.5 text-left text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
                          >
                            Close all
                          </button>
                        )
                      }
                      return null
                    })()}
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
            {user?.name
              ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
              : user?.email.slice(0, 2).toUpperCase() ?? "?"}
          </div>
          {isOpen && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium">{user?.name ?? user?.email}</p>
                {user?.isPro && (
                  <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px] leading-4">
                    Pro
                  </Badge>
                )}
              </div>
              <p className="truncate text-xs text-sidebar-foreground/50">{user?.email}</p>
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
