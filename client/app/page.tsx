"use client";

import CreateSpace from "@/components/createSpace";
import ForgetPassword from "@/components/forgetPassword";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Dockerode from "dockerode";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [spaces, setSpaces] = useState<Dockerode.ContainerInfo[] | []>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSpaces = () => {
    setIsLoading(true);
    fetch("/api/listcontainers")
      .then((res) => res.json())
      .then((data) => {
        setSpaces(data);
        console.log(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const actionContainer = async (action: "stop" | "start", id: string) => {
    const response = await fetch(`/api/container/${id}`, {
      method: "POST",
      body: JSON.stringify({ action: action }),
    });
    const data = await response.json();
    console.log(data);
    if (data.success) {
      fetchSpaces();
    }
  };

  const deleteContainer = async (id: string) => {
    try {
      const response = await fetch(`/api/container/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchSpaces();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="h-screen py-10 mx-10">
      <header>
        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold ">
          let&apos;s create work spaces. 🚀
        </h2>
      </header>
      <div>
        <Card className="w-full h-full rounded-lg overflow-hidden">
          <div className="flex justify-between px-4 py-2">
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              Your codespaces
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create new codespace</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <CreateSpace onSuccess={fetchSpaces} />
              </DialogContent>
            </Dialog>
          </div>
          <Card className="w-full  rounded-none border-r-0 border-l-0 border-b-0 border-t overflow-hidden">
            {spaces.length > 0 ? (
              spaces.map((space, index) => (
                <Card
                  key={index}
                  className="w-full p-4 flex justify-between items-center rounded-none border-r-0 border-l-0 border-b-0 border-t"
                >
                  <div>
                    <div className="flex items-center">
                      <p className="text-lg font-semibold">
                        {space.Names[0].replace("/", "")} {" - "}
                      </p>
                      <p className="text-muted-foreground text-xs mx-2">
                        {space.Id.slice(0, 12)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm text-gray-500">
                        {space.State === "running" ? (
                          <div className="size-2 rounded-full bg-green-600"></div>
                        ) : (
                          <div className="size-2 rounded-full bg-gray-400"></div>
                        )}
                      </div>
                      <p className="ml-2">
                        {space.State === "running" ? "Running" : "Not running"}{" "}
                        - {space.Status} {" - "}
                      </p>
                      {space.State === "running" && (
                        <ForgetPassword
                          id={space.Id}
                          name={space.Names[0].replace("/", "")}
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-x-3">
                    {space.State === "running" ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            disabled={space.State === "running"}
                            variant={"outline"}
                          >
                            Remove
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>cannot remove running container.</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            disabled={space.State === "running"}
                            variant={"outline"}
                          >
                            Remove
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Attention</DialogTitle>
                            <DialogDescription>
                              are you sure you want to delete space?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex items-center space-x-2"></div>
                          <DialogFooter className="sm:justify-end">
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Close
                              </Button>
                            </DialogClose>
                            <Button
                              type="submit"
                              onClick={() => deleteContainer(space.Id)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Button
                      variant={"outline"}
                      onClick={() => {
                        actionContainer(
                          space.State === "running" ? "stop" : "start",
                          space.Id
                        );
                      }}
                    >
                      {space.State === "running" ? "Stop" : "start"}
                    </Button>
                    {space.State === "running" ? (
                      <Button asChild>
                        <Link
                          href={`http://${space.Id.slice(0, 12)}-${
                            space.Ports[0].PublicPort
                          }.localhost:3005`}
                          target="_blank"
                        >
                          Open
                        </Link>
                      </Button>
                    ) : (
                      <Button variant={"outline"} disabled>
                        shutdown
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            ) : isLoading ? (
              <div className="w-full p-4 flex justify-center items-center">
                Loading...
              </div>
            ) : (
              <Card className="w-full p-4 flex justify-center items-center">
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                  No codespaces found.
                </p>
              </Card>
            )}
          </Card>
        </Card>
      </div>
    </main>
  );
}
