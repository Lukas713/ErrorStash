'use client'

import { useState, useTransition, useRef, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, X, Sparkles, Lock, Globe, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { createErrorAction } from '@/actions/errors'

export function NewEntryDialog() {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'UNSOLVED' | 'SOLVED'>('UNSOLVED')
  const [isPublic, setIsPublic] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const router = useRouter()
  const tagInputRef = useRef<HTMLInputElement>(null)

  function handleOpenChange(next: boolean) {
    if (next) {
      setFormKey(k => k + 1)
      setStatus('UNSOLVED')
      setIsPublic(false)
      setTags([])
      setTagInput('')
    }
    setOpen(next)
  }

  function addTag(value: string) {
    const trimmed = value.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed])
    }
    setTagInput('')
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  function handleTagInputChange(value: string) {
    if (value.endsWith(',')) {
      addTag(value.slice(0, -1))
    } else {
      setTagInput(value)
    }
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('status', status)
    formData.set('isPublic', isPublic ? 'true' : 'false')
    const pending = tagInput.trim()
    const allTags = pending ? [...tags, pending] : tags
    formData.set('tags', allTags.join(','))

    startTransition(async () => {
      const result = await createErrorAction(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Error entry created')
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button size="sm" className="gap-1.5" />}>
        <Plus className="size-4" />
        New
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <SheetTitle>New Entry</SheetTitle>
              <SheetDescription>Log a new error to your stash</SheetDescription>
            </div>
            <SheetClose
              render={
                <Button variant="ghost" size="icon-sm" className="-mt-1 -mr-2" />
              }
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form key={formKey} id="new-entry-form" onSubmit={handleSubmit}>
            {/* TITLE */}
            <section className="border-b px-6 py-4">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="title"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Title
                </label>
                <span className="text-[10px] text-muted-foreground">Required</span>
              </div>
              <Input
                id="title"
                name="title"
                placeholder="e.g. TypeError: Cannot read properties of undefined"
                required
                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </section>

            {/* STATUS */}
            <section className="border-b px-6 py-4">
              <div className="mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Status
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('UNSOLVED')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    status === 'UNSOLVED'
                      ? 'border-orange-500/40 bg-orange-500/10 text-orange-400'
                      : 'border-border bg-transparent text-muted-foreground hover:bg-muted/60'
                  )}
                >
                  <AlertCircle className="size-3" />
                  Unsolved
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('SOLVED')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    status === 'SOLVED'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-border bg-transparent text-muted-foreground hover:bg-muted/60'
                  )}
                >
                  <CheckCircle className="size-3" />
                  Solved
                </button>
              </div>
            </section>

            {/* DESCRIPTION */}
            <section className="border-b px-6 py-4">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="description"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Description
                </label>
                <span className="text-[10px] text-muted-foreground">Markdown supported</span>
              </div>
              <Textarea
                id="description"
                name="description"
                placeholder="What were you doing? What did you try? What was the context?"
                className="min-h-24 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </section>

            {/* STACK TRACE */}
            <section className="border-b px-6 py-4">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="stackTrace"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Stack Trace
                </label>
                <span className="text-[10px] text-muted-foreground">Raw error output</span>
              </div>
              <Textarea
                id="stackTrace"
                name="stackTrace"
                placeholder={
                  'TypeError: Cannot read properties of undefined\n  at Component (App.jsx:42:18)\n  at renderWithHooks (react-dom.js:14985)'
                }
                className="min-h-28 resize-none border-0 bg-transparent px-0 font-mono text-xs shadow-none focus-visible:ring-0"
              />
            </section>

            {/* SOLUTION */}
            <section className="border-b px-6 py-4">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="solution"
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  Solution
                </label>
                <span className="text-[10px] text-muted-foreground">
                  Optional — Markdown supported
                </span>
              </div>
              <Textarea
                id="solution"
                name="solution"
                placeholder="How did you fix it? What was the root cause?"
                className="min-h-24 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </section>

            {/* TAGS */}
            <section className="border-b px-6 py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Tags
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Press Enter or comma to add
                </span>
              </div>
              <div
                className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30"
                onClick={() => tagInputRef.current?.focus()}
              >
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs text-blue-400"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        removeTag(tag)
                      }}
                      className="ml-0.5 rounded-full text-blue-400/70 hover:text-blue-300"
                    >
                      <X className="size-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  ref={tagInputRef}
                  value={tagInput}
                  onChange={e => handleTagInputChange(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={tags.length === 0 ? 'react, hooks, typescript...' : ''}
                  className="min-w-20 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="button"
                className="mt-2 flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300"
              >
                <Sparkles className="size-3" />
                Suggest tags with AI
              </button>
            </section>

            {/* VISIBILITY */}
            <section className="px-6 py-4">
              <div className="mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Visibility
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    !isPublic
                      ? 'border-border bg-muted text-foreground'
                      : 'border-border bg-transparent text-muted-foreground hover:bg-muted/60'
                  )}
                >
                  <Lock className="size-3" />
                  Private
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    isPublic
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-border bg-transparent text-muted-foreground hover:bg-muted/60'
                  )}
                >
                  <Globe className="size-3" />
                  Public
                </button>
                <span className="text-[10px] text-muted-foreground">
                  Pro — share with community
                </span>
              </div>
            </section>
          </form>
        </div>

        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
          <Button form="new-entry-form" type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save Entry'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
