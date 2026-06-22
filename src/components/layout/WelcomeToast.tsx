"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function WelcomeToast({ name }: { name?: string | null }) {
  const router = useRouter()
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    toast.success(`Welcome back${name ? `, ${name}` : ""}!`)
    router.replace("/dashboard")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
