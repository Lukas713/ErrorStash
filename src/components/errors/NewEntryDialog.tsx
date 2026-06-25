'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { createErrorAction } from '@/actions/errors'
import { useDashboard } from '@/context/dashboard-context'
import { ErrorForm } from './ErrorForm'

export function NewEntryDialog() {
  const { newEntryOpen: open, setNewEntryOpen: setOpen } = useDashboard()
  const [formKey, setFormKey] = useState(0)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleOpenChange(next: boolean) {
    if (next) {
      setFormKey(k => k + 1)
    }
    setOpen(next)
  }

  function handleSubmit(formData: FormData) {
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
          <ErrorForm key={formKey} id="new-entry-form" onSubmit={handleSubmit} />
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
