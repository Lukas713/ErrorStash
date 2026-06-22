import SignInForm from "@/components/auth/SignInForm"

const ERROR_MESSAGES: Record<string, string> = {
  "invalid-token": "This verification link is invalid. Please sign in and request a new one.",
  "expired-token": "This verification link has expired. Please sign in and request a new one.",
}

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function SignInPage({ searchParams }: Props) {
  const { error } = await searchParams
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? null) : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignInForm initialError={errorMessage} />
    </div>
  )
}
