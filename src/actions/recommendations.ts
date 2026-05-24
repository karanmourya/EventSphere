"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

interface EventSummary {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  banner_url: string | null;
  start_time: string;
  timezone: string;
  city: string | null;
  categories: { name: string } | null;
  profiles: { name: string; avatar_url: string | null } | null;
  priceRange?: { min: number; max: number };
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
    .select("id, title, slug, short_description, banner_url, start_time, timezone, city, categories(name), profiles!events_organizer_id_fkey(name, avatar_url)")
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
    slug: (e as any).slug,
    short_description: e.short_description,
    banner_url: (e as any).banner_url,
    start_time: (e as any).start_time,
    timezone: (e as any).timezone,
    city: e.city,
    categories: (e.categories as any) ?? null,
    profiles: (e.profiles as any) ?? null,
  }));

  // Fetch ticket prices for all events
  const eventIds = events.map((e) => e.id);
  const { data: tickets } = await supabase
    .from("tickets")
    .select("event_id, price")
    .in("event_id", eventIds);

  const ticketMap = new Map<string, { min: number; max: number }>();
  tickets?.forEach((t) => {
    const existing = ticketMap.get(t.event_id);
    if (existing) {
      existing.min = Math.min(existing.min, t.price);
      existing.max = Math.max(existing.max, t.price);
    } else {
      ticketMap.set(t.event_id, { min: t.price, max: t.price });
    }
  });

  events.forEach((e) => {
    e.priceRange = ticketMap.get(e.id) ?? { min: 0, max: 0 };
  });

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
      (e) => e.categories?.name && userInterests.includes(e.categories.name)
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
      (e) => e.categories?.name && userInterests.includes(e.categories.name)
    );
    return { events: matched.slice(0, 6) };
  }
}
