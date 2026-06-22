"use server"

import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function changePasswordAction(formData: FormData): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (newPassword !== confirmPassword) return { error: "Passwords do not match" }
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user?.password) return { error: "No password set for this account" }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password)
  if (!passwordMatch) return { error: "Current password is incorrect" }

  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  })

  return {}
}

export async function deleteAccountAction() {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.user.delete({ where: { id: session.user.id } })
  await signOut({ redirectTo: "/sign-in" })
}
