"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(form: HTMLFormElement) {
    setError(null)
    setIsPending(true)
    const email = (form.elements.namedItem("email") as HTMLInputElement).value

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? "Something went wrong.")
        return
      }

      setSuccess(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">
          ✉️
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
        <p className="text-sm text-muted-foreground">
          If an account with that email exists, we&apos;ve sent a password reset link. Check your
          inbox (and spam folder).
        </p>
        <Link
          href="/sign-in"
          className="block text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
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
          type="email"
          name="email"
          placeholder="Email address"
          required
          autoComplete="email"
          disabled={isPending}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
