import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // This completely removes the cookie from the user's browser
    response.cookies.delete("admin_token");

    return response;
  } catch (error) {
    console.error("Logout Error:", error);
    
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

// Optional: Export a GET method as well if you want to allow 
// users to log out by simply visiting /api/auth/logout via a standard link.
export async function GET() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
  response.cookies.delete("admin_token");
  return response;
}