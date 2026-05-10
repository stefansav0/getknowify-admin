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