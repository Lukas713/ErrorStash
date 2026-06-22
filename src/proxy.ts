import { auth } from "@/auth"

export const proxy = auth(async (req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    return Response.redirect(new URL("/sign-in", req.nextUrl.origin))
  }
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
