import { createClient } from "@/utils/supabase/server";

interface Gift {
  description: string;
}

export default async function GiftsIdPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: authUser } = await supabase.auth.getUser();

  const recieverId = (await params).id;

  const { data, error } = await supabase
    .from("gifts")
    .select("id, participant_id, description")
    .eq("reciever", recieverId);

  if (error) {
    return <p>Oops! We couldn’t load the gifts. Please try again.</p>;
  }

  return <></>;
}
