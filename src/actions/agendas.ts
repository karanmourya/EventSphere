"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface AgendaItem {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
}

export async function generateSchedule(eventDetails: {
  title: string;
  category?: string;
  startTime: string;
  endTime: string;
  description?: string;
}): Promise<{ items?: AgendaItem[]; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "AI service not configured. Missing GEMINI_API_KEY." };
  }

  const client = new GoogleGenAI({ apiKey });

  const start = new Date(eventDetails.startTime);
  const end = new Date(eventDetails.endTime);
  const durationHours =
    Math.round(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 10) /
    10;

  const prompt = `Create a detailed event schedule/agenda for the following event.
Return ONLY valid JSON — an array of objects with these fields:
- title (string): session/talk title
- description (string): 1-2 sentence description
- start_time (ISO 8601 string)
- end_time (ISO 8601 string)

Event details:
- Title: ${eventDetails.title}
${eventDetails.category ? `- Category: ${eventDetails.category}` : ""}
- Start: ${eventDetails.startTime}
- End: ${eventDetails.endTime}
- Duration: ${durationHours} hours
${eventDetails.description ? `- About: ${eventDetails.description.slice(0, 300)}` : ""}

Rules:
- Sessions must fit within the event start/end times
- Include realistic breaks (lunch, coffee breaks)
- Sessions should be 30-90 minutes each
- Vary session types (keynote, workshop, panel, networking, etc.)
- Return ONLY the JSON array, no markdown fences, no explanation`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text ?? "";
    // Strip markdown code fences if present
    text = text.replace(/```json?\s*/gi, "").replace(/```\s*/g, "").trim();

    const items: AgendaItem[] = JSON.parse(text);
    if (!Array.isArray(items) || items.length === 0) {
      return { error: "AI returned an invalid schedule format." };
    }

    return { items };
  } catch (err) {
    console.error("Gemini schedule error:", err);
    return {
      error: "Failed to generate schedule. Please try again.",
    };
  }
}

export async function saveAgenda(
  eventId: string,
  items: AgendaItem[]
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in." };

  // Verify ownership
  const { data: event } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    return { error: "You do not own this event." };
  }

  // Clear existing agenda
  await supabase.from("agenda").delete().eq("event_id", eventId);

  // Insert new items
  const inserts = items.map((item) => ({
    event_id: eventId,
    title: item.title,
    description: item.description || null,
    start_time: item.start_time,
    end_time: item.end_time,
  }));

  const { error } = await supabase.from("agenda").insert(inserts);

  if (error) return { error: "Failed to save agenda." };

  revalidatePath(`/dashboard/event/${eventId}/edit`);
  revalidatePath(`/event/`);
  return { success: true };
}

export async function getAgenda(eventId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("agenda")
    .select("*")
    .eq("event_id", eventId)
    .order("start_time");

  return data ?? [];
}
