"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEventFAQs(eventId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_faqs")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  return data ?? [];
}

export async function createFAQ(
  eventId: string,
  question: string,
  answer: string
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
    .from("event_faqs")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  await supabase.from("event_faqs").insert({
    event_id: eventId,
    question: question.trim(),
    answer: answer.trim(),
    sort_order: count ?? 0,
  });

  revalidatePath(`/event/[slug]`, "page");
  revalidatePath(`/dashboard/event/${eventId}/edit`);
  return { success: true };
}

export async function deleteFAQ(faqId: string, eventId: string) {
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

  await supabase.from("event_faqs").delete().eq("id", faqId);

  revalidatePath(`/event/[slug]`, "page");
  revalidatePath(`/dashboard/event/${eventId}/edit`);
  return { success: true };
}
