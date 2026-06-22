"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { LogOut, User } from "lucide-react"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { signOutAction } from "@/actions/auth"

interface SidebarUserMenuProps {
  name?: string | null
  email?: string | null
  image?: string | null
  isPro?: boolean
  isOpen: boolean
}

export default function SidebarUserMenu({ name, email, image, isPro, isOpen }: SidebarUserMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 items-center gap-2 border-t border-sidebar-border p-2",
        !isOpen && "md:justify-center md:p-1",
      )}
    >
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="flex shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        aria-label="User menu"
      >
        <UserAvatar name={name} email={email} image={image} size={28} />
      </button>

      {isOpen && (
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium">{name ?? email}</p>
            {isPro && (
              <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px] leading-4">
                Pro
              </Badge>
            )}
          </div>
          <p className="truncate text-xs text-sidebar-foreground/50">{email}</p>
        </div>
      )}

      {menuOpen && (
        <div
          className={cn(
            "absolute bottom-full left-0 z-50 mb-1 min-w-[160px] rounded-md border border-sidebar-border bg-popover py-1 shadow-md",
            !isOpen && "left-1/2 -translate-x-1/2",
          )}
        >
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <User className="size-3.5" />
            Profile
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
