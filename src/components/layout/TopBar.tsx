'use client'

import { Search, Menu } from "lucide-react";
import { NewEntryDialog } from "@/components/errors/NewEntryDialog";
import { useDashboard } from "@/context/dashboard-context";

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { setCommandOpen } = useDashboard();

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <button
        onClick={onMenuClick}
        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden"
      >
        <Menu className="size-4" />
      </button>
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="relative flex h-8 flex-1 max-w-xl items-center gap-2 rounded-md bg-muted/40 pl-8 pr-2 text-sm text-muted-foreground hover:bg-muted/60"
        >
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4" />
          <span className="flex-1 truncate text-left">
            Search errors by title, tag, or solution...
          </span>
          <kbd className="pointer-events-none hidden shrink-0 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <NewEntryDialog />
    </header>
  );
}
