import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Point this DIRECTLY to your live deployed backend
    // Notice: NO trailing slash after .com
    const BACKEND_URL = process.env.BACKEND_API_URL || "https://getknowify.com"; 

    // This will fetch from: https://getknowify.com/api/visits
    const response = await fetch(`${BACKEND_URL}/api/visit`, {
      method: "GET",
      cache: "no-store", 
      headers: {
        "Content-Type": "application/json",
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