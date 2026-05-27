"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function checkInByQR(eventId: string, qrCode: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Verify organizer ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    return { error: "Not authorized." };
  }

  // Find registration by QR code
  const { data: registration, error: regError } = await supabase
    .from("registrations")
    .select("id, user_id, status, checked_in, profiles(name)")
    .eq("qr_code", qrCode)
    .eq("event_id", eventId)
    .single();

  if (regError || !registration) {
    return { error: "Invalid QR code. No matching registration found." };
  }

  if (registration.status !== "approved") {
    return { error: `Registration is ${registration.status}, not approved.` };
  }

  if (registration.checked_in) {
    const profile = registration.profiles as any;
    return { error: `${profile?.name ?? "Attendee"} is already checked in.` };
  }

  // Check in the registration
  const { error: updateError } = await supabase
    .from("registrations")
    .update({ checked_in: true })
    .eq("id", registration.id);

  if (updateError) return { error: "Failed to check in." };

  // Log the check-in
  await supabase.from("checkins").insert({
    registration_id: registration.id,
    event_id: eventId,
    checked_in_by: user.id,
    method: "qr",
  });

  const profile = registration.profiles as any;
  revalidatePath(`/dashboard/event/${eventId}/checkin`);
  return {
    success: true,
    name: profile?.name ?? "Unknown",
    message: `${profile?.name ?? "Attendee"} checked in successfully!`,
  };
}

export async function checkInManual(eventId: string, registrationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Verify organizer ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    return { error: "Not authorized." };
  }

  // Find registration
  const { data: registration } = await supabase
    .from("registrations")
    .select("id, user_id, status, checked_in, profiles(name)")
    .eq("id", registrationId)
    .eq("event_id", eventId)
    .single();

  if (!registration) {
    return { error: "Registration not found." };
  }

  if (registration.status !== "approved") {
    return { error: `Registration is ${registration.status}, not approved.` };
  }

  if (registration.checked_in) {
    const profile = registration.profiles as any;
    return { error: `${profile?.name ?? "Attendee"} is already checked in.` };
  }

  // Check in
  const { error: updateError } = await supabase
    .from("registrations")
    .update({ checked_in: true })
    .eq("id", registration.id);

  if (updateError) return { error: "Failed to check in." };

  // Log the check-in
  await supabase.from("checkins").insert({
    registration_id: registration.id,
    event_id: eventId,
    checked_in_by: user.id,
    method: "manual",
  });

  const profile = registration.profiles as any;
  revalidatePath(`/dashboard/event/${eventId}/checkin`);
  return {
    success: true,
    name: profile?.name ?? "Unknown",
    message: `${profile?.name ?? "Attendee"} checked in successfully!`,
  };
}

export async function getCheckinStats(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Verify organizer ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id, title")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) return null;

  // Count registrations
  const { count: totalRegistered } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "approved");

  // Count checked in
  const { count: totalCheckedIn } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "approved")
    .eq("checked_in", true);

  return {
    eventTitle: event.title,
    totalRegistered: totalRegistered ?? 0,
    totalCheckedIn: totalCheckedIn ?? 0,
  };
}

export async function getRegistrationsForCheckin(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Verify organizer ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) return [];

  const { data: registrations } = await supabase
    .from("registrations")
    .select(
      "id, status, checked_in, qr_code, created_at, profiles(name, username, avatar_url), tickets(name, ticket_type)"
    )
    .eq("event_id", eventId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  return registrations ?? [];
}
