import {
  TextRevealCard,
  TextRevealCardTitle,
} from "@/components/text-reveal-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/server";

export default async function GroupIdPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: authUser } = await supabase.auth.getUser();

  const groupId = (await params).id;

  const { data, error } = await supabase
    .from("groups")
    .select(
      `
      name,
      participants (*)
    `
    )
    .eq("id", groupId)
    .single();

  if (error) {
    return <p>Oops! We couldn’t load the groups. Please try again.</p>;
  }

  const assignedParticipantId = data.participants.find(
    (p) => authUser?.user?.email === p.email
  )?.assigned_to;

  const assignedParticipant = data.participants.find(
    (p) => p.id === assignedParticipantId
  );

  return (
    <main className="container mx-auto py-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              Group{" "}
              <span className="font-light underline decoration-red-400">
                {data.name}
              </span>
            </CardTitle>
          </div>
          <CardDescription>Group and participants infos</CardDescription>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Participants</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-6" />
          <TextRevealCard
            text="Uncover the details"
            revealText={assignedParticipant.name}
          >
            <TextRevealCardTitle className="w-full">
              Your secret santa
            </TextRevealCardTitle>
          </TextRevealCard>
        </CardContent>
      </Card>
    </main>
  );
}
