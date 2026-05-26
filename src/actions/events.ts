"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { seedCategories } from "@/lib/seed-categories";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EventVisibility, RegistrationMode } from "@/types";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface CreateEventInput {
  title: string;
  shortDescription: string;
  description?: string;
  categoryId?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  city?: string;
  venue?: string;
  onlineLink?: string;
  bannerUrl?: string;
  visibility: EventVisibility;
  registrationMode: RegistrationMode;
}

export async function createEvent(input: CreateEventInput) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create an event." };
  }

  // Auto-upgrade role to organizer
  await admin
    .from("profiles")
    .update({ role: "organizer" })
    .eq("id", user.id);

  const slug = generateSlug(input.title);

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return { error: "An event with this title already exists. Please choose a different title." };
  }

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      organizer_id: user.id,
      title: input.title,
      slug,
      short_description: input.shortDescription,
      description: input.description || null,
      banner_url: input.bannerUrl || null,
      category_id: input.categoryId || null,
      start_time: input.startTime,
      end_time: input.endTime,
      timezone: input.timezone,
      city: input.city || null,
      venue: input.venue || null,
      online_link: input.onlineLink || null,
      visibility: input.visibility,
      registration_mode: input.registrationMode,
      status: "published",
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Failed to create event. Please try again." };
  }

  revalidatePath("/dashboard/events");
  redirect(`/dashboard/events`);
}

export async function getCategories() {
  await seedCategories();

  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return data ?? [];
}

export async function getEventBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*, profiles!events_organizer_id_fkey(id, name, username, avatar_url, bio), categories(id, name, slug)")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  // Fetch tickets for this event
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", data.id)
    .order("price");

  return { ...data, tickets: tickets ?? [] };
}

export async function getOrganizerEvents(organizerId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", organizerId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getDashboardEvents() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("events")
    .select("*, categories(name)")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
