import { auth } from "@/auth"

const PROTECTED = (pathname: string) =>
  pathname.startsWith("/dashboard") || pathname === "/profile"

export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl

  if (!req.auth && PROTECTED(pathname)) {
    return Response.redirect(new URL("/sign-in", req.nextUrl.origin))
  }

  if (req.auth && PROTECTED(pathname)) {
    const emailVerified = req.auth.user?.emailVerified
    if (!emailVerified) {
      return Response.redirect(new URL("/verify-email", req.nextUrl.origin))
    }
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/profile"],
}
