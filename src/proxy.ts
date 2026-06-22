import { auth } from "@/auth"

export const proxy = auth(async (req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    return Response.redirect(new URL("/sign-in", req.nextUrl.origin))
  }

  // Block unverified credentials users from accessing the dashboard
  if (req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    const emailVerified = req.auth.user?.emailVerified
    if (!emailVerified) {
      return Response.redirect(new URL("/verify-email", req.nextUrl.origin))
    }
  }
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
