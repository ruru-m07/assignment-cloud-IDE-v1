import Docker from "dockerode";

export async function POST(request: Request) {
  const { id } = await request.json();
  const docker = new Docker();

  const container = docker.getContainer(id);

  if (!container) {
    return Response.json(
      {
        error: "Container not found",
      },
      {
        status: 404,
      }
    );
  }

  const data = await container.exec({
    Cmd: ["cat", "/home/coder/.config/code-server/config.yaml"],
    AttachStdin: true,
    AttachStdout: true,
  });

  const stream = await data.start({});
  let password = "";

  stream.on("data", (chunk) => {
    const output = chunk.toString();
    console.log("output", output);
    const lines = output.split("\n");
    for (const line of lines) {
      if (line.startsWith("password:")) {
        // Extracting the password from the line
        password = line.split(":")[1].trim();
        break;
      }
    }
  });

  await new Promise((resolve) => {
    stream.on("end", () => {
      resolve({});
    });
  });

  return Response.json({
    password: password,
  });
}
