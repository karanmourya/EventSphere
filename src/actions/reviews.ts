"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createReview(
  eventId: string,
  rating: number,
  comment: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  if (rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }

  // Check user has a registration for this event
  const { data: registration } = await supabase
    .from("registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  if (!registration) {
    return { error: "You must have registered for this event to review it." };
  }

  const { error } = await supabase.from("reviews").upsert({
    event_id: eventId,
    user_id: user.id,
    rating,
    comment: comment.trim() || null,
  });

  if (error) return { error: "Failed to submit review." };

  revalidatePath(`/event/${eventId}`);
  const { data: event } = await supabase
    .from("events")
    .select("slug")
    .eq("id", eventId)
    .single();

  if (event?.slug) revalidatePath(`/event/${event.slug}`);
  return { success: true };
}

export async function deleteReview(reviewId: string, eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  revalidatePath(`/event/${eventId}`);
  const { data: event } = await supabase
    .from("events")
    .select("slug")
    .eq("id", eventId)
    .single();

  if (event?.slug) revalidatePath(`/event/${event.slug}`);
  return { success: true };
}

export async function getEventReviews(eventId: string) {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(name, username, avatar_url)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  // Calculate average
  const { data: allRatings } = await supabase
    .from("reviews")
    .select("rating")
    .eq("event_id", eventId);

  const avg =
    allRatings && allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : 0;

  return {
    reviews: reviews ?? [],
    average: Math.round(avg * 10) / 10,
    count: allRatings?.length ?? 0,
  };
}

export async function getUserReview(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: review } = await supabase
    .from("reviews")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  return review;
}

export async function hasUserAttended(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  return !!data;
}
