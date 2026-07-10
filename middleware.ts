import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

// 1. ADD 'async' HERE
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_token")?.value;

  const publicRoutes = ["/login"];

  if (publicRoutes.includes(pathname)) {
    if (token) {
      try {
        // 2. ADD 'await' HERE
        await verifyToken(token);

        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch (error) {
        // Invalid token - just fall through to the login page
      }
    }
    return NextResponse.next();
  }

  // Protect everything else
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // 3. ADD 'await' HERE
    await verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("admin_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/blogs/:path*",
    "/letters/:path*",
    "/quizzes/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/login",
  ],
};