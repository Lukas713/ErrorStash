import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import ResetPasswordForm from "@/components/auth/ResetPasswordForm"

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <InvalidLink reason="missing" />
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } })
  const isValid =
    record && record.identifier.startsWith("password-reset:") && record.expires > new Date()

  if (!isValid) {
    return <InvalidLink reason="expired" />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <ResetPasswordForm token={token} />
    </div>
  )
}

function InvalidLink({ reason }: { reason: "missing" | "expired" }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {reason === "expired" ? "Link expired" : "Invalid reset link"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {reason === "expired"
            ? "This password reset link has expired or has already been used."
            : "This password reset link is missing or invalid."}
        </p>
        <Link
          href="/forgot-password"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Request a new link
        </Link>
      </div>
    </div>
  )
}
