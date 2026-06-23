import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NewEntryDialog } from "@/components/errors/NewEntryDialog";

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <button
        onClick={onMenuClick}
        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden"
      >
        <Menu className="size-4" />
      </button>
      <div className="flex flex-1 items-center gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search errors by title, description, or tag..."
            className="pl-8 h-8 bg-muted/40 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <NewEntryDialog />
    </header>
  );
}
