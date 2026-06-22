"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(form: HTMLFormElement) {
    setError(null)
    setIsPending(true)
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim() || undefined,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
      confirmPassword: (form.elements.namedItem("confirmPassword") as HTMLInputElement).value,
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? "Registration failed.")
        return
      }

      toast.success("Account created! Please sign in.")
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
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Start logging your errors with ErrorStash
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(e.currentTarget) }} className="space-y-3">
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Input
          type="text"
          name="name"
          placeholder="Name (optional)"
          autoComplete="name"
          disabled={isPending}
        />
        <Input
          type="email"
          name="email"
          placeholder="Email address"
          required
          autoComplete="email"
          disabled={isPending}
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoComplete="new-password"
          disabled={isPending}
        />
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          required
          autoComplete="new-password"
          disabled={isPending}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
