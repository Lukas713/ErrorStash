import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getProfileData } from "@/lib/db/profile"
import { formatDate } from "@/lib/format"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Badge } from "@/components/ui/badge"
import ChangePasswordForm from "@/components/profile/ChangePasswordForm"
import DeleteAccountForm from "@/components/profile/DeleteAccountForm"

export default async function ProfilePage() {
  const data = await getProfileData()

  if (!data) redirect("/sign-in")

  const { user, stats } = data

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        {/* User Info */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h2>
          <div className="flex items-center gap-4">
            <UserAvatar name={user.name} email={user.email} image={user.image} size={64} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-lg font-semibold">{user.name ?? user.email}</p>
                {user.isPro && (
                  <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px] leading-4">
                    Pro
                  </Badge>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </section>

        {/* Usage Stats */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Stats
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total Entries" value={stats.totalEntries} />
            <StatCard label="Solved" value={stats.solvedEntries} />
            <StatCard label="Unsolved" value={stats.unsolvedEntries} />
            <StatCard label="Tags" value={stats.totalTags} />
          </div>
        </section>

        {/* Account Actions */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account Actions
          </h2>
          <div className="space-y-6">
            {user.hasPassword && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Change Password</p>
                <p className="text-xs text-muted-foreground">
                  Update the password for your email account.
                </p>
                <ChangePasswordForm />
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
              <DeleteAccountForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/50 p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
