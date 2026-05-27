"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEventSpeakers(eventId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("speakers")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  return data ?? [];
}

export async function createSpeaker(
  eventId: string,
  data: {
    name: string;
    title?: string;
    company?: string;
    bio?: string;
    avatarUrl?: string;
    linkedinUrl?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    return { error: "Not authorized." };
  }

  const { count } = await supabase
    .from("speakers")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  const { error } = await supabase.from("speakers").insert({
    event_id: eventId,
    name: data.name.trim(),
    title: data.title?.trim() || null,
    company: data.company?.trim() || null,
    bio: data.bio?.trim() || null,
    avatar_url: data.avatarUrl?.trim() || null,
    linkedin_url: data.linkedinUrl?.trim() || null,
    sort_order: count ?? 0,
  });

  if (error) return { error: "Failed to add speaker." };

  revalidatePath(`/event/[slug]`, "page");
  revalidatePath(`/dashboard/event/${eventId}/edit`);
  return { success: true };
}

export async function deleteSpeaker(speakerId: string, eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    return { error: "Not authorized." };
  }

  await supabase.from("speakers").delete().eq("id", speakerId);

  revalidatePath(`/event/[slug]`, "page");
  revalidatePath(`/dashboard/event/${eventId}/edit`);
  return { success: true };
}
