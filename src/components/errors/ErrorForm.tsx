'use client'

import { useState, useRef, type KeyboardEvent, type FormEvent } from 'react'
import { X, Sparkles, Lock, Globe, AlertCircle, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export interface ErrorFormDefaults {
  title?: string
  status?: 'UNSOLVED' | 'SOLVED'
  description?: string | null
  stackTrace?: string | null
  solution?: string | null
  tags?: string[]
  isPublic?: boolean
}

interface ErrorFormProps {
  id: string
  defaults?: ErrorFormDefaults
  onSubmit: (formData: FormData) => void
}

/**
 * Shared error entry form fields, used by both create (NewEntryDialog) and
 * edit (ErrorEntryDrawer). Text fields are uncontrolled (defaultValue) so they
 * pre-fill from `defaults`; status/visibility/tags are controlled. Remount the
 * component (via a `key`) to reset it back to `defaults`.
 */
export function ErrorForm({ id, defaults, onSubmit }: ErrorFormProps) {
  const [status, setStatus] = useState<'UNSOLVED' | 'SOLVED'>(defaults?.status ?? 'UNSOLVED')
  const [isPublic, setIsPublic] = useState(defaults?.isPublic ?? false)
  const [tags, setTags] = useState<string[]>(defaults?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const tagInputRef = useRef<HTMLInputElement>(null)

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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('status', status)
    formData.set('isPublic', isPublic ? 'true' : 'false')
    const pending = tagInput.trim()
    const allTags = pending ? [...tags, pending] : tags
    formData.set('tags', allTags.join(','))
    onSubmit(formData)
  }

  return (
    <form id={id} onSubmit={handleSubmit}>
      {/* TITLE */}
      <section className="border-b px-6 py-4">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor={`${id}-title`}
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Title
          </label>
          <span className="text-[10px] text-muted-foreground">Required</span>
        </div>
        <Input
          id={`${id}-title`}
          name="title"
          defaultValue={defaults?.title ?? ''}
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
            htmlFor={`${id}-description`}
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Description
          </label>
          <span className="text-[10px] text-muted-foreground">Markdown supported</span>
        </div>
        <Textarea
          id={`${id}-description`}
          name="description"
          defaultValue={defaults?.description ?? ''}
          placeholder="What were you doing? What did you try? What was the context?"
          className="min-h-24 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </section>

      {/* STACK TRACE */}
      <section className="border-b px-6 py-4">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor={`${id}-stackTrace`}
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Stack Trace
          </label>
          <span className="text-[10px] text-muted-foreground">Raw error output</span>
        </div>
        <Textarea
          id={`${id}-stackTrace`}
          name="stackTrace"
          defaultValue={defaults?.stackTrace ?? ''}
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
            htmlFor={`${id}-solution`}
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Solution
          </label>
          <span className="text-[10px] text-muted-foreground">
            Optional — Markdown supported
          </span>
        </div>
        <Textarea
          id={`${id}-solution`}
          name="solution"
          defaultValue={defaults?.solution ?? ''}
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
  )
}
