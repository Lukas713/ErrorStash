import ErrorList from '@/components/errors/ErrorList'
import WelcomeToast from '@/components/layout/WelcomeToast'
import { auth } from '@/auth'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const params = await searchParams
  const showWelcome = params.welcome === "1"
  const session = showWelcome ? await auth() : null

  return (
    <>
      {showWelcome && <WelcomeToast name={session?.user?.name} />}
      <ErrorList />
    </>
  )
}
