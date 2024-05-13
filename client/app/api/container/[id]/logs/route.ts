import Dockerode from "dockerode";
import Docker from "dockerode";
import stream from "stream";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const docker = new Docker();

  let allLogs: any = "";

  async function containerLogs(container: Dockerode.Container) {
    return new Promise((resolve, reject) => {
      const logStream = new stream.PassThrough();

      logStream.on("data", function (chunk) {
        allLogs += chunk.toString("utf8");
        // console.log(allLogs);
      });

      container.logs(
        {
          follow: true,
          stdout: true,
          stderr: true,
        },
        function (err, stream) {
          if (err) {
            reject(err);
            return;
          }

          if (!stream) {
            return;
          }

          container.modem.demuxStream(stream, logStream, logStream);

          stream.on("end", function () {
            logStream.end("!stop!");
          });

          setTimeout(function () {
            // stream.destroy();
            resolve({});
          }, 1200);
        }
      );
    });
  }

  try {
    const container = docker.getContainer(id);

    await containerLogs(container);

    return new Response(allLogs);
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
    });
  }
}
