import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionUser = request.cookies.get("session_user")?.value;
  const { pathname } = request.nextUrl;

  // Define protected routes
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/staff");

  // 1. Redirect to login if accessing protected route without session
  if (isProtectedRoute && !sessionUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Redirect to dashboard if accessing auth route with active session
  if (isAuthRoute && !!sessionUser) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Redirect to dashboard if accessing home page with active session
  if (pathname === "/" && !!sessionUser) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
