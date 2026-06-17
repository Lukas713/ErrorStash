'use client'

import { useState } from "react"
import TopBar from "./TopBar"
import Sidebar from "./Sidebar"
import { DashboardProvider } from "@/context/dashboard-context"
import type { ErrorEntryWithTags, DashboardUser } from "@/lib/db/errors"
import type { TagWithCount } from "@/lib/db/error-tags"

export default function DashboardShell({
  children,
  entries,
  tags,
  user,
}: {
  children: React.ReactNode
  entries: ErrorEntryWithTags[]
  tags: TagWithCount[]
  user: DashboardUser | null
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <DashboardProvider initialEntries={entries} initialTags={tags} user={user}>
      <div className="flex h-screen flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(prev => !prev)} />
          <main className="flex-1 overflow-hidden bg-background">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  )
}
