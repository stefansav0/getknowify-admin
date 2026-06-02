import { NextResponse } from "next/server";

export async function GET() {
  try {
    // This is the URL of your deployed separate backend server
    const BACKEND_URL = process.env.BACKEND_API_URL || "https://www.getknowify.com/"; // Change port if testing locally

    // Server-to-Server fetch (Bypasses browser CORS rules)
    const response = await fetch(`${BACKEND_URL}/api/visits`, {
      method: "GET",
      // Important: Add cache: 'no-store' so Next.js doesn't freeze old data
      cache: "no-store", 
      headers: {
        "Content-Type": "application/json",
        // You can add a secret API key here later to secure your backend!
        // "x-api-key": process.env.SECRET_ADMIN_KEY 
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin Proxy Fetch Error:", error);
    return NextResponse.json(
      { success: false, visits: [], message: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}