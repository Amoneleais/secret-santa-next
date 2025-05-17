"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Resend } from "resend";

export type CreateGroupState = {
  success: null | boolean;
  message?: string;
};

export async function createGroup(
  _previousState: CreateGroupState,
  formData: FormData
) {
  const supabase = await createClient();

  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return {
      success: false,
      message: "Hang tight — we're working on it. Try again in a moment.",
    };
  }
  const names = formData.getAll("name") as string[];
  const emails = formData.getAll("email") as string[];
  const groupName = formData.get("group-name") as string;
  const groupId = formData.get("group-id") as string;

  let group;

  if (groupId) {
    const { data: updatedGroup, error } = await supabase
      .from("groups")
      .update({ name: groupName })
      .eq("id", groupId)
      .select()
      .single();

    if (error)
      return {
        success: false,
        message: "Hang tight — we're working on it. Try again in a moment.",
      };

    await supabase.from("participants").delete().eq("group_id", groupId);

    group = updatedGroup;
  } else {
    const { data: newGroup, error } = await supabase
      .from("groups")
      .insert({ name: groupName, owner_id: authUser?.user.id })
      .select()
      .single();

    if (error)
      return {
        success: false,
        message: "Hang tight — we're working on it. Try again in a moment.",
      };

    group = newGroup;
  }

  const participants = names.map((name, index) => ({
    group_id: group.id,
    name,
    email: emails[index],
  }));

  const { data: createdParticipants, error: errorParticipants } = await supabase
    .from("participants")
    .insert(participants)
    .select();

  if (errorParticipants)
    return {
      success: false,
      message: "Hang tight — we're working on it. Try again in a moment.",
    };

  const drawnParticipants = drawGroup(createdParticipants);

  const { error: errorDraw } = await supabase
    .from("participants")
    .upsert(drawnParticipants);

  if (errorDraw)
    return {
      success: false,
      message: "Hang tight — we're working on it. Try again in a moment.",
    };

  const { error: errorResend } = await sendEmailToParticipants(
    drawnParticipants,
    groupName
  );

  if (errorResend) return { success: false, message: errorResend };

  redirect(`/home/groups/${group.id}`);
}

type Participants = {
  id: string;
  group_id: string;
  name: string;
  email: string;
  assigned_to: string | null;
  created_at: string;
};

function drawGroup(participants: Participants[]) {
  const selectedParticipants: string[] = [];

  return participants.map((participant) => {
    const availableParticipants = participants.filter(
      (p) => p.id != participant.id && !selectedParticipants.includes(p.id)
    );

    const assignedParticipant =
      availableParticipants[
        Math.floor(Math.random() * availableParticipants.length)
      ];

    selectedParticipants.push(assignedParticipant.id);

    return {
      ...participant,
      assigned_to: assignedParticipant.id,
    };
  });
}

async function sendEmailToParticipants(
  participants: Participants[],
  groupName: string
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await Promise.all(
      participants.map((participant) => {
        resend.emails.send({
          from: "Secret Santa <onboarding@resend.dev>",
          to: participant.email,
          subject: `${groupName} - 🎅 Your Secret Santa Assignment!`,
          html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
                  <h2 style="color: #d6336c;">🎁 Secret Santa Time! 🎅</h2>
                  <p>Hi <strong>${participant.name}</strong>,</p>
                  <p>The moment you've been waiting for has arrived — the Secret Santa draw is complete!</p>
                  <p>You will be the Secret Santa for: <strong style="font-size: 1.2em;">${participants.find((p) => p.id === participant.assigned_to)?.name}</strong> 🤫</p>
                  <p>Remember to keep it a secret and make your gift special. Whether it's something small, creative, or fun — it’s the thought that counts!</p>
                  <p>Happy gifting and happy holidays! 🎄✨</p>
                  <hr style="margin-top: 30px;" />
                  <p style="font-size: 0.9em; color: #666;">Please do not reply to this email. If you have questions, reach out to the event organizer.</p>
                </div>`,
        });
      })
    );

    return { error: null };
  } catch {
    return {
      error: "Hang tight — we're working on it. Try again in a moment.",
    };
  }
}
