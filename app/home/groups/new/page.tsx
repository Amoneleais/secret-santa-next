import NewGroupForm from "@/components/new-group-form";
import { createClient } from "@/utils/supabase/server";

export default async function NewGroupPage({
  searchParams,
}: {
  searchParams: { groupId?: string };
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const loggedUser = {
    id: data.user?.id as string,
    email: data.user?.email as string,
  };

  interface Participant {
    name: string;
    email: string;
  }

  const groupId = (await searchParams).groupId;

  let group = null;
  let participants: Participant[] = [];

  if (groupId) {
    const { data: groupData } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    const { data: participantsData } = await supabase
      .from("participants")
      .select("name,email")
      .eq("group_id", groupId);

    group = groupData;
    participants = participantsData || [];
  }

  return (
    <div className="mt-40">
      <NewGroupForm
        loggedUser={loggedUser}
        groupId={groupId ? { id: groupId } : undefined}
        initialGroup={group}
        initialParticipants={participants}
      />
    </div>
  );
}
