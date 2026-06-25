'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Star, Pin, Pencil, Trash2, X, Tag,
  CheckCircle, AlertCircle, ChevronDown,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/context/dashboard-context'
import { updateErrorAction } from '@/actions/errors'
import type { ErrorEntryDetail } from '@/lib/db/errors'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { ErrorForm } from './ErrorForm'

function DrawerSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-3 w-1/3 rounded bg-muted" />
      <div className="space-y-2 pt-2">
        <div className="h-3 rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="h-3 w-4/6 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
    </div>
  )
}

function CollapsibleSection({
  label,
  defaultOpen = true,
  headerRight,
  children,
}: {
  label: string
  defaultOpen?: boolean
  headerRight?: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex w-full items-center justify-between px-6 py-3 hover:bg-muted/20"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {headerRight}
          <ChevronDown
            className={cn(
              'size-3.5 text-muted-foreground/60 transition-transform duration-150',
              open && 'rotate-180'
            )}
          />
        </div>
      </button>
      {open && <div className="px-6 pb-4">{children}</div>}
    </div>
  )
}

export function ErrorEntryDrawer() {
  const { selectedEntryId, setSelectedEntryId, user, updateEntry, removeEntry } = useDashboard()
  const [entry, setEntry] = useState<ErrorEntryDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSaving, startSaving] = useTransition()
  const router = useRouter()

  const open = selectedEntryId !== null

  useEffect(() => {
    if (!selectedEntryId) {
      setEntry(null)
      setEditing(false)
      return
    }
    setLoading(true)
    setEditing(false)
    setEntry(null)
    fetch(`/api/errors/${selectedEntryId}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => setEntry(data))
      .catch(() => toast.error('Failed to load entry'))
      .finally(() => setLoading(false))
  }, [selectedEntryId])

  function handleOpenChange(next: boolean) {
    if (!next) setSelectedEntryId(null)
  }

  function handleEditSubmit(formData: FormData) {
    if (!entry) return
    const id = entry.id
    formData.set('id', id)
    startSaving(async () => {
      const result = await updateErrorAction(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.entry) {
        setEntry(result.entry)
        updateEntry(id, {
          status: result.entry.status,
          isPublic: result.entry.isPublic,
        })
      }
      setEditing(false)
      toast.success('Entry updated')
      router.refresh()
    })
  }

  function handleCopyStackTrace() {
    if (!entry?.stackTrace) return
    navigator.clipboard.writeText(entry.stackTrace)
    toast.success('Stack trace copied')
  }

  function handleCopySolution() {
    if (!entry?.solution) return
    navigator.clipboard.writeText(entry.solution)
    toast.success('Solution copied')
  }

  function handleToggleFavorite() {
    if (!entry) return
    const next = !entry.isFavorite
    setEntry(prev => prev ? { ...prev, isFavorite: next } : null)
    updateEntry(entry.id, { isFavorite: next })
    startTransition(async () => {
      const res = await fetch(`/api/errors/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: next }),
      })
      if (!res.ok) {
        setEntry(prev => prev ? { ...prev, isFavorite: !next } : null)
        updateEntry(entry.id, { isFavorite: !next })
        toast.error('Failed to update')
      }
    })
  }

  function handleTogglePin() {
    if (!entry) return
    const next = !entry.isPinned
    setEntry(prev => prev ? { ...prev, isPinned: next } : null)
    updateEntry(entry.id, { isPinned: next })
    startTransition(async () => {
      const res = await fetch(`/api/errors/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: next }),
      })
      if (!res.ok) {
        setEntry(prev => prev ? { ...prev, isPinned: !next } : null)
        updateEntry(entry.id, { isPinned: !next })
        toast.error('Failed to update')
      }
    })
  }

  function handleToggleVisibility() {
    if (!entry) return
    const next = !entry.isPublic
    setEntry(prev => prev ? { ...prev, isPublic: next } : null)
    updateEntry(entry.id, { isPublic: next })
    startTransition(async () => {
      const res = await fetch(`/api/errors/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: next }),
      })
      if (!res.ok) {
        setEntry(prev => prev ? { ...prev, isPublic: !next } : null)
        updateEntry(entry.id, { isPublic: !next })
        toast.error('Failed to update')
      }
    })
  }

  function handleDelete() {
    if (!entry) return
    const id = entry.id
    startTransition(async () => {
      const res = await fetch(`/api/errors/${id}`, { method: 'DELETE' })
      if (res.ok) {
        removeEntry(id)
        setSelectedEntryId(null)
        toast.success('Entry deleted')
        router.refresh()
      } else {
        toast.error('Failed to delete')
      }
    })
  }

  const isOwner = entry?.userId === user?.id

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetTitle className="sr-only">{entry?.title ?? 'Error Entry'}</SheetTitle>
        <SheetDescription className="sr-only">Error entry details</SheetDescription>

        {editing && entry && (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Edit Entry</h2>
              <SheetClose
                render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground" />}
              >
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ErrorForm
                key={entry.id}
                id="edit-entry-form"
                defaults={{
                  title: entry.title,
                  status: entry.status,
                  description: entry.description,
                  stackTrace: entry.stackTrace,
                  solution: entry.solution,
                  tags: entry.tags.map(t => t.name),
                  isPublic: entry.isPublic,
                }}
                onSubmit={handleEditSubmit}
              />
            </div>

            <SheetFooter>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button form="edit-entry-form" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            </SheetFooter>
          </>
        )}

        {!editing && (
          <>
        {/* Header: title, actions, meta */}
        <div className="shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            {loading || !entry ? (
              <div className="mt-1 h-5 w-2/3 animate-pulse rounded bg-muted" />
            ) : (
              <h2 className="text-base font-semibold leading-snug text-foreground">{entry.title}</h2>
            )}

            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleToggleFavorite}
                disabled={!entry || isPending}
                className={cn(entry?.isFavorite ? 'text-yellow-400' : 'text-muted-foreground')}
              >
                <Star className={cn('size-4', entry?.isFavorite && 'fill-yellow-400')} />
                <span className="sr-only">Favorite</span>
              </Button>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleTogglePin}
                  disabled={!entry || isPending}
                  className={cn(entry?.isPinned ? 'text-yellow-400' : 'text-muted-foreground')}
                >
                  <Pin className={cn('size-4', entry?.isPinned && 'fill-yellow-400')} />
                  <span className="sr-only">{entry?.isPinned ? 'Unpin' : 'Pin'}</span>
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditing(true)}
                  disabled={!entry || isPending}
                  className="text-muted-foreground"
                >
                  <Pencil className="size-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
              <SheetClose
                render={<Button variant="ghost" size="icon-sm" className="text-muted-foreground" />}
              >
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>
          </div>

          {entry && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
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
              {entry.isPinned && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Pin className="size-3" />
                  Pinned
                </span>
              )}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {loading && <DrawerSkeleton />}

          {!loading && entry && (
            <div>
              {/* Description */}
              {entry.description && (
                <CollapsibleSection label="Description">
                  <div className="prose">
                    <ReactMarkdown>{entry.description}</ReactMarkdown>
                  </div>
                </CollapsibleSection>
              )}

              {/* Stack Trace */}
              {entry.stackTrace && (
                <CollapsibleSection label="Stack Trace">
                  <div className="relative rounded-md bg-muted/50">
                    <button
                      type="button"
                      onClick={handleCopyStackTrace}
                      className="absolute right-2 top-2 z-10 rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Copy
                    </button>
                    <pre className="overflow-x-auto p-3 pt-7 font-mono text-xs text-foreground/90 whitespace-pre-wrap break-words">
                      {entry.stackTrace}
                    </pre>
                  </div>
                </CollapsibleSection>
              )}

              {/* Solution */}
              {entry.solution && (
                <CollapsibleSection label="Solution">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleCopySolution}
                      className="absolute right-0 top-0 z-10 rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Copy
                    </button>
                    <div className="prose pr-12">
                      <ReactMarkdown>{entry.solution}</ReactMarkdown>
                    </div>
                  </div>
                </CollapsibleSection>
              )}

              {/* Tags */}
              <CollapsibleSection label="Tags">
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400"
                    >
                      <Tag className="size-3" />
                      {tag.name}
                    </span>
                  ))}
                  <button
                    type="button"
                    className="inline-flex items-center rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                  >
                    + Add tag
                  </button>
                </div>
              </CollapsibleSection>

              {/* Visibility */}
              <div className="border-b border-border px-6 py-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Visibility
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex overflow-hidden rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => { if (entry.isPublic) handleToggleVisibility() }}
                      disabled={isPending || !isOwner}
                      className={cn(
                        'px-3 py-1 text-xs font-medium transition-colors',
                        !entry.isPublic
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Private
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (!entry.isPublic) handleToggleVisibility() }}
                      disabled={isPending || !isOwner}
                      className={cn(
                        'px-3 py-1 text-xs font-medium transition-colors',
                        entry.isPublic
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Public
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">Pro feature</span>
                </div>
              </div>
            </div>
          )}
        </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
