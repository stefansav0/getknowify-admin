export async function GET() {

  try {

    const response = await fetch(
      "https://getknowify.com/api/quiz/",
      {
        cache: "no-store",
      }
    );

    const data =
      await response.json();

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