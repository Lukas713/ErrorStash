import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { token, password, confirmPassword } = await request.json()

    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const record = await prisma.verificationToken.findUnique({ where: { token } })

    if (!record || !record.identifier.startsWith("password-reset:")) {
      return NextResponse.json({ error: "Invalid reset link" }, { status: 400 })
    }

    if (record.expires < new Date()) {
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      )
    }

    const email = record.identifier.replace("password-reset:", "")
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({ where: { email }, data: { password: hashedPassword } }),
      prisma.verificationToken.delete({ where: { token } }),
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
