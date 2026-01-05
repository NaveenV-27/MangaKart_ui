import { NextResponse, NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath =
    path === "/admin/login" ||
    path === "/admin/signup" ||
    path === "/signup" ||
    path === "/login";

  const userToken = request.cookies.get("USER")?.value || "";
  const adminToken = request.cookies.get("ADMIN")?.value || "";

  const userIsLoggedIn = !!userToken;
  const adminIsLoggedIn = !!adminToken;

  // 🔒 If already logged in, block access to public paths
  if (isPublicPath && userIsLoggedIn) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }
  if (isPublicPath && adminIsLoggedIn) {
    return NextResponse.redirect(
      new URL("/admin", request.nextUrl)
    );
  }

  // Restrict admin from accessing receptionist dashboard
  if (
    path.startsWith("/admin") &&
    userIsLoggedIn &&
    !adminIsLoggedIn
  ) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // 🔐 If not logged in, block access to protected routes
  if (!isPublicPath && !userIsLoggedIn && !adminIsLoggedIn) {
    return NextResponse.redirect(
      new URL("/login", request.nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manga/:path*",
    "/",
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    "/cart",
    "/genres",
    "/manga",
    "/profile",
    "/search",
    "/login",
    "/signup",
    "/admin/login",
    "/admin/signup",
  ],
}