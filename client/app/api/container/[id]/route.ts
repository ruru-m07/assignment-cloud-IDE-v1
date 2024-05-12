import Docker from "dockerode";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const docker = new Docker();

  try {
    const container = docker.getContainer(id);
    const containerInfo = await container.inspect();

    return Response.json(containerInfo);
  } catch (error) {
    return Response.json({
      error: error,
    });
  }
}
