import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Routes that require authentication
  const protectedRoutes = ["/agents", "/projects"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Allow API auth routes through
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect to sign-in if accessing protected route while not authenticated
  if (isProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to home if already logged in and trying to access sign-in
  if (nextUrl.pathname === "/auth/signin" && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Match routes that should go through middleware
  matcher: [
    // Protected routes
    "/agents/:path*",
    "/projects/:path*",
    // Auth pages
    "/auth/:path*",
    // API auth routes (to allow through)
    "/api/auth/:path*",
  ],
};
