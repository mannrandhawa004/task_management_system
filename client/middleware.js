import { NextResponse } from "next/server";

export function middleware(request) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const pathname = request.nextUrl.pathname;

  const protectedRoute = pathname.startsWith("/dashboard");

  if (protectedRoute && !refreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (refreshToken && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
