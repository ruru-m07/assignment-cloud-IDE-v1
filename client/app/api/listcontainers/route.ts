import Docker from "dockerode";

export async function GET() {
  const docker = new Docker();

  try {
    const containers = await docker.listContainers({
      all: true,
      filters: { ancestor: ["codercom/code-server"] },
    });

    return Response.json(containers);
  } catch (error) {
    console.error("Error:", error);
    return Response.json({
      error: error,
    });
  }
}
