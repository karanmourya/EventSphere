"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Check if already wishlisted
  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlists").delete().eq("id", existing.id);
    revalidatePath("/explore");
    revalidatePath("/dashboard/wishlist");
    revalidatePath(`/event/${eventId}`);
    return { success: true, wishlisted: false };
  } else {
    await supabase.from("wishlists").insert({
      user_id: user.id,
      event_id: eventId,
    });
    revalidatePath("/explore");
    revalidatePath("/dashboard/wishlist");
    revalidatePath(`/event/${eventId}`);
    return { success: true, wishlisted: true };
  }
}

export async function isWishlisted(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_id", eventId)
    .maybeSingle();

  return !!data;
}

export async function getWishlistedEvents() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("wishlists")
    .select("id, created_at, events(*, categories(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getWishlistStatuses(eventIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || eventIds.length === 0) return {};

  const { data } = await supabase
    .from("wishlists")
    .select("event_id")
    .eq("user_id", user.id)
    .in("event_id", eventIds);

  const statusMap: Record<string, boolean> = {};
  eventIds.forEach((id) => {
    statusMap[id] = false;
  });
  data?.forEach((w) => {
    statusMap[w.event_id] = true;
  });

  return statusMap;
}

export async function sendEventReminders() {
  const supabase = await createClient();

  // Find events starting in the next 24 hours
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, title, start_time")
    .eq("status", "published")
    .gte("start_time", now.toISOString())
    .lte("start_time", tomorrow.toISOString());

  if (!upcomingEvents || upcomingEvents.length === 0) return { sent: 0 };

  let totalSent = 0;

  for (const event of upcomingEvents) {
    // Get wishlisted users for this event
    const { data: wishlistedUsers } = await supabase
      .from("wishlists")
      .select("user_id")
      .eq("event_id", event.id);

    if (!wishlistedUsers) continue;

    for (const { user_id } of wishlistedUsers) {
      // Check if already has a reminder for this event
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user_id)
        .eq("type", "event_reminder")
        .contains("link", event.id)
        .maybeSingle();

      if (existing) continue;

      await supabase.from("notifications").insert({
        user_id,
        type: "event_reminder",
        title: "Event starting soon!",
        message: `${event.title} starts within 24 hours. Don't miss it!`,
        link: `/event/${event.id}`,
      });

      totalSent++;
    }
  }

  return { sent: totalSent };
}
