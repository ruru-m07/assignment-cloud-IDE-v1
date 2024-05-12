"use client";

import CreateSpace from "@/components/createSpace";
import ForgetPassword from "@/components/forgetPassword";
import ListSpaces from "@/components/listSpaces";
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
                <ListSpaces
                  key={index}
                  fetchSpaces={fetchSpaces}
                  space={space}
                />
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
