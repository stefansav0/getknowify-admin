import { connectDB } from "@/lib/db";

export async function GET() {

  try {

    await connectDB();

    return Response.json({
      success: true,
      message: "MongoDB Connected",
    });

  } catch (error) {

    return Response.json({
      success: false,
      error: error.message,
    });

  }
}