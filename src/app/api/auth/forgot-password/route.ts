import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    })

    if (!user) {
      return NextResponse.json({ success: true })
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses GitHub sign-in. Please sign in with GitHub instead." },
        { status: 400 }
      )
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: `password-reset:${email}` },
    })

    const token = randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: { identifier: `password-reset:${email}`, token, expires },
    })

    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
