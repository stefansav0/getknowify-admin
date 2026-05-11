export async function GET() {

  try {

    const response = await fetch(
      `https://getknowify.com/api/score`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {

      return Response.json(
        {
          success: false,
          error: "Failed to fetch scores",
        },
        {
          status: response.status,
        }
      );
    }

    const data =
      await response.json();

    // Always return array safely
    return Response.json(
      Array.isArray(data)
        ? data
        : data.scores || []
    );

  } catch (error) {

    console.error(error);

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