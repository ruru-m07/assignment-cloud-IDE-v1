/* eslint-disable react-hooks/exhaustive-deps */
import Dockerode from "dockerode";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

const ListLogs = ({ space }: { space: Dockerode.ContainerInfo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/container/${space.Id}/logs`);
      const text = await response.text();
      setLogs(text);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <DialogContent className="sm:max-w-[1000px] h-[80vh] mx-10 ">
      <DialogHeader>
        <DialogTitle>Logs</DialogTitle>
        <DialogDescription className="flex justify-between items-center w-full">
          <p>
            Logs of the container {space.Names[0].replace("/", "")} -
            {space.Id.slice(0, 12)}.
          </p>
          <Button disabled={isLoading} onClick={fetchLogs}>
            {isLoading ? "refresh..." : "refresh"}
          </Button>
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center space-x-2">
        <div className=" w-full">
          {isLoading ? (
            <div className="h-[400px] w-[900px] p-4 flex items-center justify-center">
                Loading...
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <ScrollArea className="h-[400px] w-[900px] rounded-md border p-4">
                <pre>{logs}</pre>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default ListLogs;
