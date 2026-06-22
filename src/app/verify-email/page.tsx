import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">
            ✉️
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Check your inbox</h1>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to your email address. Click the link to activate your account.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          The link expires in 24 hours. If you don&apos;t see the email, check your spam folder.
        </p>

        <Link href="/sign-in" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
