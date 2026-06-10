export async function GET() {
  try {
    // Fetching from your main live site's NHIE endpoint
    const response = await fetch(
      "https://getknowify.com/api/nhie", 
      {
        cache: "no-store", // Ensures you always see the latest quizzes
      }
    );

    const data = await response.json();

    return Response.json(data);

  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}