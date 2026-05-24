"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

interface EventSummary {
  id: string;
  title: string;
  city: string | null;
  category: string | null;
  short_description: string | null;
}

export async function getRecommendedEvents(): Promise<{
  events?: EventSummary[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { events: [] };

  // Get user's registered events to understand preferences
  const { data: registrations } = await supabase
    .from("registrations")
    .select("tickets!inner(event_id, events!inner(title, city, categories(name)))")
    .eq("user_id", user.id)
    .limit(20);

  // Get available public events
  const { data: availableEvents } = await supabase
    .from("events")
    .select("id, title, city, short_description, categories!inner(name)")
    .eq("status", "published")
    .eq("visibility", "public")
    .gte("start_time", new Date().toISOString())
    .limit(50);

  if (!availableEvents || availableEvents.length === 0) {
    return { events: [] };
  }

  const events: EventSummary[] = availableEvents.map((e) => ({
    id: e.id,
    title: e.title,
    city: e.city,
    category: (e.categories as any)?.name ?? null,
    short_description: e.short_description,
  }));

  // If no history, return first 6 upcoming events
  if (!registrations || registrations.length === 0) {
    return { events: events.slice(0, 6) };
  }

  // Extract user interests from registration history
  const registeredEvents = (registrations as any[])
    .flatMap((r) => r.tickets?.events ?? [])
    .filter(Boolean);

  const userInterests = [
    ...new Set(
      registeredEvents
        .map((e: any) => e?.categories?.name)
        .filter(Boolean)
    ),
  ];
  const userCities = [
    ...new Set(
      registeredEvents.map((e: any) => e?.city).filter(Boolean)
    ),
  ];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback: filter by matching categories
    const matched = events.filter(
      (e) => e.category && userInterests.includes(e.category)
    );
    return { events: matched.slice(0, 6) };
  }

  const client = new GoogleGenAI({ apiKey });

  const prompt = `You are an event recommendation engine. Pick the 6 best events for this user.

User interests (categories they've attended): ${userInterests.join(", ") || "none"}
User cities: ${userCities.join(", ") || "none"}

Available events (JSON array):
${JSON.stringify(events)}

Return ONLY a JSON array of event IDs (strings), exactly 6 or fewer. Pick events that match the user's interests and location. No explanation, no markdown fences.`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text ?? "";
    text = text.replace(/```json?\s*/gi, "").replace(/```\s*/g, "").trim();

    const ids: string[] = JSON.parse(text);
    const recommended = events.filter((e) => ids.includes(e.id));
    return { events: recommended.slice(0, 6) };
  } catch (err) {
    console.error("Recommendation error:", err);
    // Fallback: category match
    const matched = events.filter(
      (e) => e.category && userInterests.includes(e.category)
    );
    return { events: matched.slice(0, 6) };
  }
}
