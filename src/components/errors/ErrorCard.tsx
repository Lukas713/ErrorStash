import { Pin, Star, Globe, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import type { ErrorEntryWithTags } from '@/lib/db/errors'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'

export default function ErrorCard({ entry, onClick }: { entry: ErrorEntryWithTags; onClick?: () => void }) {
  return (
    <div className="flex cursor-pointer items-start gap-3 border-b border-border px-4 py-3 hover:bg-muted/30" onClick={onClick}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{entry.title}</p>

        {entry.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {entry.tags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-violet-500/20 text-violet-300"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-1.5 flex items-center gap-2 text-xs">
          {entry.status === 'SOLVED' ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="size-3.5" />
              Solved
            </span>
          ) : (
            <span className="flex items-center gap-1 text-orange-400">
              <AlertCircle className="size-3.5" />
              Unsolved
            </span>
          )}
          <span className="text-muted-foreground">{formatDate(entry.createdAt)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
        {entry.isPublic ? (
          <Globe className="size-4 text-emerald-400" />
        ) : (
          <Lock className="size-4 text-muted-foreground/30" />
        )}
        <Pin className={cn('size-4', entry.isPinned ? 'text-yellow-400' : 'text-muted-foreground/30')} />
        <Star className={cn('size-4', entry.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30')} />
      </div>
    </div>
  )
}
