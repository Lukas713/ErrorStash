'use client'

import { useState } from "react"
import TopBar from "./TopBar"
import Sidebar from "./Sidebar"
import { DashboardProvider } from "@/context/dashboard-context"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <DashboardProvider>
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
