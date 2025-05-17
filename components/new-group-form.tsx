"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Mail, Trash2 } from "lucide-react";
import { Separator } from "./ui/separator";
import { createGroup, CreateGroupState } from "@/app/home/groups/new/actions";
import { toast } from "sonner";

interface Participant {
  name: string;
  email: string;
}

export default function NewGroupForm({
  loggedUser,
  groupId,
  initialGroup,
  initialParticipants,
}: Readonly<{
  loggedUser: { id: string; email: string };
  groupId?: { id?: string };
  initialGroup?: { name: string };
  initialParticipants?: Participant[];
}>) {
  const [groupName, setGroupName] = useState(initialGroup?.name ?? "");

  const [participants, setParticipants] = useState<Participant[]>(
    initialParticipants?.length
      ? initialParticipants
      : [{ name: "", email: loggedUser.email }]
  );

  const [state, formAction, pending] = useActionState<
    CreateGroupState,
    FormData
  >(createGroup, {
    success: null,
    message: "",
  });

  function updateParticipant(
    index: number,
    field: keyof Participant,
    value: string
  ) {
    const updatedParticipants = [...participants];
    updatedParticipants[index][field] = value;
    setParticipants(updatedParticipants);
  }

  function removeParticipant(index: number) {
    setParticipants(participants.filter((_, i) => i != index));
  }

  function addParticipant() {
    setParticipants(participants.concat({ name: "", email: "" }));
  }

  useEffect(() => {
    if (state.success === false) {
      toast("Oops! Something went wrong", {
        description: state.message,
        className: "bg-destructive",
      });
    }
  }, [state]);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{groupId ? "Edit Group" : "New Group"}</CardTitle>
        <CardDescription>
          Get your friends in on the fun—send them an invite!
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <Input type="hidden" name="group-id" value={groupId?.id || ""} />
          <div className="space-y-2">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              name="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Give your group a name"
              required
            />
          </div>

          <h2 className="!mt-12">Participants</h2>
          {participants.map((participant, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-4"
            >
              <div className="flex-grow space-y-2 w-full">
                <Label htmlFor={`name-${index}`}>Name</Label>
                <Input
                  id={`name-${index}`}
                  name="name"
                  value={participant.name}
                  onChange={(e) => {
                    updateParticipant(index, "name", e.target.value);
                  }}
                />
              </div>

              <div className="flex-grow space-y-2 w-full">
                <Label htmlFor={`email-${index}`}>Email</Label>
                <Input
                  id={`email-${index}`}
                  name="email"
                  value={participant.email}
                  type="email"
                  onChange={(e) => {
                    updateParticipant(index, "email", e.target.value);
                  }}
                  className="read-only:text-muted-foreground"
                  readOnly={participant.email === loggedUser.email}
                  required
                />
              </div>
              <div className="min-w-9">
                {participants.length > 1 &&
                  participant.email != loggedUser.email && (
                    <Button
                      type="button"
                      variant={"outline"}
                      size={"icon"}
                      onClick={() => removeParticipant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </CardContent>
        <Separator className="my-4" />
        <CardFooter className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
          <Button
            type="button"
            variant={"outline"}
            onClick={addParticipant}
            className="w-full md:w-auto"
          >
            Add Friend
          </Button>
          <Button
            type="submit"
            className="flex items-center space-x-2 w-full md:w-auto"
          >
            <Mail className="w-3 h-3" />
            {groupId
              ? "Update group and send email invites"
              : "Create group and send email invites"}
            {pending && <Loader2 className="animate-spin" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
