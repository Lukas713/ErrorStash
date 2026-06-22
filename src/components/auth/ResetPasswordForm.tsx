"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  token: string
}

export default function ResetPasswordForm({ token }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(form: HTMLFormElement) {
    setError(null)
    setIsPending(true)
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? "Something went wrong.")
        return
      }

      toast.success("Password reset! Please sign in with your new password.")
      router.push("/sign-in")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>
      </div>

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
          name="password"
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
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving…" : "Reset password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="underline-offset-4 hover:underline">
          Request a new link
        </Link>
      </p>
    </div>
  )
}
