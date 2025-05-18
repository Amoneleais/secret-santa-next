import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/server";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Mail } from "lucide-react";
import Link from "next/link";

export default async function GiftsPage() {
  const supabase = await createClient();

  const { data: authUser } = await supabase.auth.getUser();

  const { data: userIds, error: userIdsError } = await supabase
    .from("participants")
    .select("id")
    .eq("email", authUser.user?.email);

  if (userIdsError) {
    return <p>Oops! We couldn’t load the gifts. Please try again.</p>;
  }

  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id, group_id, name, email")
    .in(
      "assigned_to",
      userIds.map((u) => u.id)
    );

  if (participantsError) {
    return <p>Oops! We couldn’t load the gifts. Please try again.</p>;
  }
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Gifts</h1>
      <Separator />
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {participants.map((participant) => (
            <Link
              href={`/home/gifts/${participant.id}`}
              key={participant.id}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{participant.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Mail className="mr-2 h-4 w-4" />
                    {participant.email}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </main>
  );
}
