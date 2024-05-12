import Docker from "dockerode";
import os from "os";

const POST_TO_CONTAINER: {
  [port: string]: Docker.Container | undefined;
} = {};

const CONTAINER_TO_POST: {
  [id: string]: string;
} = {};

export async function POST(request: Request) {
  const { name } = await request.json();
  const docker = new Docker();
  const homedir = os.homedir();

  const availablePorts = (() => {
    for (let i = 8000; i < 8999; i++) {
      if (POST_TO_CONTAINER[i]) continue;
      return `${i}`;
    }
  })();

  if (!availablePorts) {
    return new Response(JSON.stringify({ error: "No available ports" }), {
      status: 500,
    });
  }

  try {
    const image = docker.getImage("codercom/code-server");

    if (!image) {
      console.log("image not found, pulling...");
      await docker.pull("codercom/code-server");
    }

    // ! : if you are not able to create any image then try to run `mkdir ~/.config` manualy

    const container = await docker.createContainer({
      Image: "codercom/code-server",
      name: name,
      HostConfig: {
        PortBindings: {
          "8080/tcp": [
            {
              HostIp: "127.0.0.1",
              HostPort: availablePorts,
            },
          ],
        },
        // Binds: [
        // `${homedir}/.config:/home/coder/.config`,
        // ],
      },
      // Env: [`DOCKER_USER=root`],
    });

    POST_TO_CONTAINER[availablePorts] = container;
    CONTAINER_TO_POST[container.id] = availablePorts;

    await container.start();

    const createdir = await container.exec({
      Cmd: ["mkdir", "workspace"],
      AttachStdin: true,
      AttachStdout: true,
    });

    const streamcreatedir = await createdir.start({});
    streamcreatedir.on("data", (chunk) => {
      const output = chunk.toString();
      console.log("output", output);
    });

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

    // Waiting for the stream to end before sending the response
    await new Promise((resolve) => {
      stream.on("end", () => {
        resolve({});
      });
    });

    // Send the response with the password
    return new Response(
      JSON.stringify({
        url: `http://${container.id.slice(
          0,
          12
        )}-${availablePorts}.localhost:3005?folder=/home/coder/workspace`,
        id: container.id.slice(0, 12),
        password: password,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    // Return a response with an error message
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
