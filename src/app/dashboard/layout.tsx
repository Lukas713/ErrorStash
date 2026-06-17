import DashboardShell from "@/components/layout/DashboardShell";
import { getErrorEntries, getCurrentUser } from "@/lib/db/errors";
import { getTagsWithCounts } from "@/lib/db/error-tags";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const [entries, tags] = await Promise.all([
    getErrorEntries(),
    getTagsWithCounts(user?.id ?? '', user?.isPro ?? false),
  ]);
  return <DashboardShell entries={entries} tags={tags} user={user}>{children}</DashboardShell>;
}
