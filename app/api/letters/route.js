export async function GET() {

  try {

    const response = await fetch(
      "https://getknowify.com/api/letter/",
      {
        method: "GET",
        cache: "no-store",
      }
    );

    // Response failed
    if (!response.ok) {

      return Response.json(
        {
          success: false,
          error:
            "Failed to fetch letters",
        },
        {
          status: response.status,
        }
      );
    }

    // Parse JSON
    const data =
      await response.json();

    // Success
    return Response.json(
      {
        success: true,
        letters: data,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "Letters Fetch Error:",
      error
    );

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

// ==========================================
// DELETE LETTER PROXY
// ==========================================
export async function DELETE(
  request,
  { params }
) {

  try {

    const { id } =
      await params;

    const response = await fetch(
      `https://getknowify.com/api/letter/${id}`,
      {
        method: "DELETE",
      }
    );

    const data =
      await response.json();

    return Response.json(data);

  } catch (error) {

    console.error(
      "Delete Proxy Error:",
      error
    );

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