"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notifications";
import type { FieldType } from "@/types";

// ============ Form Fields ============

export async function createFormField(
  eventId: string,
  data: {
    label: string;
    fieldType: FieldType;
    required: boolean;
    options?: string[];
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Verify ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    return { error: "Not authorized." };
  }

  // Get display_order
  const { data: existing } = await supabase
    .from("event_form_fields")
    .select("display_order")
    .eq("event_id", eventId)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = (existing?.[0]?.display_order ?? 0) + 1;

  const { error } = await supabase.from("event_form_fields").insert({
    event_id: eventId,
    label: data.label,
    field_type: data.fieldType,
    required: data.required,
    options: data.fieldType === "select" || data.fieldType === "checkbox" ? data.options : null,
    display_order: nextOrder,
  });

  if (error) return { error: "Failed to add field." };

  revalidatePath(`/dashboard/event/${eventId}/forms`);
  return { success: true };
}

export async function getFormFields(eventId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("event_form_fields")
    .select("*")
    .eq("event_id", eventId)
    .order("display_order");

  return data ?? [];
}

export async function deleteFormField(fieldId: string, eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("event_form_fields")
    .delete()
    .eq("id", fieldId);

  if (error) return { error: "Failed to delete field." };

  revalidatePath(`/dashboard/event/${eventId}/forms`);
  return { success: true };
}

export async function reorderFormFields(
  eventId: string,
  fieldIds: string[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  for (let i = 0; i < fieldIds.length; i++) {
    await supabase
      .from("event_form_fields")
      .update({ display_order: i + 1 })
      .eq("id", fieldIds[i])
      .eq("event_id", eventId);
  }

  revalidatePath(`/dashboard/event/${eventId}/forms`);
  return { success: true };
}

// ============ Applications ============

export async function submitApplication(
  eventId: string,
  answers: { fieldId: string; answer: string }[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to apply." };

  // Check for existing application
  const { data: existing } = await supabase
    .from("event_applications")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "You have already applied. Current status: " + existing.status };
  }

  // Create application
  const { data: application, error } = await supabase
    .from("event_applications")
    .insert({
      event_id: eventId,
      user_id: user.id,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !application) {
    return { error: "Failed to submit application." };
  }

  // Save answers
  const answerInserts = answers
    .filter((a) => a.answer.trim())
    .map((a) => ({
      application_id: application.id,
      field_id: a.fieldId,
      answer: a.answer,
    }));

  if (answerInserts.length > 0) {
    await supabase.from("application_answers").insert(answerInserts);
  }

  // Notify organizer of new application
  const { data: event } = await supabase
    .from("events")
    .select("organizer_id, title")
    .eq("id", eventId)
    .single();

  if (event) {
    await createNotification(
      event.organizer_id,
      "new_application",
      "New application received",
      `Someone applied for ${event.title}`,
      `/dashboard/event/${eventId}/applications`
    );
  }

  revalidatePath(`/dashboard/event/${eventId}/applications`);
  return { success: true, applicationId: application.id };
}

export async function getApplications(eventId: string) {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("event_applications")
    .select("*, profiles!event_applications_user_id_fkey(name, username, avatar_url, bio, linkedin_url)")
    .eq("event_id", eventId)
    .order("submitted_at", { ascending: false });

  if (!applications || applications.length === 0) return [];

  // Fetch answers with field labels
  const appIds = applications.map((a) => a.id);
  const { data: answers } = await supabase
    .from("application_answers")
    .select("*, event_form_fields(label)")
    .in("application_id", appIds);

  // Group answers by application
  const answerMap = new Map<string, typeof answers>();
  answers?.forEach((a) => {
    const existing = answerMap.get(a.application_id) ?? [];
    existing.push(a);
    answerMap.set(a.application_id, existing);
  });

  return applications.map((app) => ({
    ...app,
    answers: answerMap.get(app.id) ?? [],
  }));
}

export async function reviewApplication(
  applicationId: string,
  status: "approved" | "rejected" | "waitlisted"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Get the application to find the event
  const { data: application } = await supabase
    .from("event_applications")
    .select("id, event_id, user_id")
    .eq("id", applicationId)
    .single();

  if (!application) return { error: "Application not found." };

  // Verify organizer ownership
  const { data: event } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", application.event_id)
    .single();

  if (!event || event.organizer_id !== user.id) {
    return { error: "Not authorized." };
  }

  const { error } = await supabase
    .from("event_applications")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", applicationId);

  if (error) return { error: "Failed to update application." };

  // If approved, also create a registration
  if (status === "approved") {
    await supabase.from("registrations").upsert({
      event_id: application.event_id,
      user_id: application.user_id,
      status: "approved",
    });
  }

  // Notify applicant of the decision
  const { data: eventData } = await supabase
    .from("events")
    .select("title")
    .eq("id", application.event_id)
    .single();

  const statusMessages = {
    approved: {
      title: "Application approved!",
      message: `Your application for ${eventData?.title ?? "the event"} has been approved. You can now get tickets.`,
    },
    rejected: {
      title: "Application not accepted",
      message: `Your application for ${eventData?.title ?? "the event"} was not accepted at this time.`,
    },
    waitlisted: {
      title: "Application waitlisted",
      message: `You've been placed on the waitlist for ${eventData?.title ?? "the event"}.`,
    },
  };

  const statusType = `application_${status}` as
    | "application_approved"
    | "application_rejected"
    | "application_waitlisted";

  await createNotification(
    application.user_id,
    statusType,
    statusMessages[status].title,
    statusMessages[status].message,
    `/apply/${application.event_id}`
  );

  revalidatePath(`/dashboard/event/${application.event_id}/applications`);
  return { success: true };
}

export async function getEventForForm(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("events")
    .select("*, categories(name)")
    .eq("id", eventId)
    .single();

  if (!data || data.organizer_id !== user.id) return null;
  return data;
}

export async function getMyApplication(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("event_applications")
    .select("id, status, submitted_at")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

export async function getEventForApplication(eventId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("*, categories(name)")
    .eq("id", eventId)
    .eq("registration_mode", "approval")
    .single();

  return data;
}

export async function getApplicationFormFields(eventId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("event_form_fields")
    .select("*")
    .eq("event_id", eventId)
    .order("display_order");

  return data ?? [];
}
