import DashboardShell from "@/components/layout/DashboardShell";
import { getErrorEntries, getCurrentUser } from "@/lib/db/errors";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [entries, user] = await Promise.all([getErrorEntries(), getCurrentUser()]);
  return <DashboardShell entries={entries} user={user}>{children}</DashboardShell>;
}
