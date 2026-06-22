import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

  await resend.emails.send({
    from: "ErrorStash <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="margin-bottom:8px">Verify your email</h2>
        <p style="color:#6b7280">Click the button below to verify your email address and access your ErrorStash account.</p>
        <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:500">
          Verify email
        </a>
        <p style="color:#6b7280;font-size:13px">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        <p style="color:#9ca3af;font-size:12px">Or copy this URL: ${verifyUrl}</p>
      </div>
    `,
  })
}
