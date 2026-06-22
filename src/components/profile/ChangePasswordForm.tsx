"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { changePasswordAction } from "@/actions/user"

export default function ChangePasswordForm() {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(form: HTMLFormElement) {
    setError(null)
    setIsPending(true)

    try {
      const result = await changePasswordAction(new FormData(form))

      if (result.error) {
        setError(result.error)
        return
      }

      toast.success("Password updated successfully.")
      form.reset()
      setOpen(false)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Change Password
      </Button>
    )
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit(e.currentTarget)
        }}
        className="space-y-3"
      >
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Input
          type="password"
          name="currentPassword"
          placeholder="Current password"
          required
          autoComplete="current-password"
          disabled={isPending}
        />
        <Input
          type="password"
          name="newPassword"
          placeholder="New password"
          required
          autoComplete="new-password"
          disabled={isPending}
          minLength={8}
        />
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          required
          autoComplete="new-password"
          disabled={isPending}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save Password"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setOpen(false)
              setError(null)
            }}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
