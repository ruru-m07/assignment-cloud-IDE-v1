import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import Dockerode from "dockerode";

const ForgetPassword = ({ id, name }: { id: string; name: string }) => {
  const [data, setData] = useState<{
    password: string;
  } | null>(null);

  const fetchPassword = async () => {
    const response = await fetch("/api/getpassword", {
      method: "POST",
      body: JSON.stringify({
        id: id,
      }),
    });
    const data = await response.json();
    setData(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"link"}
          className="font-medium text-primary underline underline-offset-4"
        >
          forgot password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>forgot password?</DialogTitle>
          <DialogDescription>
            here we can add more authentication security but for now just ok!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {data && (
            <div>
              <p>space name: {name}</p>
              <p>password: {data.password}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button onClick={fetchPassword}>Get Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForgetPassword;
