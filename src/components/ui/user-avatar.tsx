import Image from "next/image"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name?: string | null
  email?: string | null
  image?: string | null
  size?: number
  className?: string
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return "?"
}

export function UserAvatar({ name, email, image, size = 28, className }: UserAvatarProps) {
  const initials = getInitials(name, email)

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? email ?? "User avatar"}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  )
}
