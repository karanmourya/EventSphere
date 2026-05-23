"use server";

import { createClient } from "@/lib/supabase/server";

interface ExploreFilters {
  search?: string;
  category?: string;
  city?: string;
  price?: "free" | "paid";
  page?: number;
  limit?: number;
}

export async function getPublicEvents(filters: ExploreFilters = {}) {
  const supabase = await createClient();
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("events")
    .select(
      "*, profiles!events_organizer_id_fkey(name, username, avatar_url), categories(name, slug)",
      { count: "exact" }
    )
    .eq("status", "published")
    .eq("visibility", "public")
    .order("start_time", { ascending: true })
    .range(offset, offset + limit - 1);

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,city.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`
    );
  }

  if (filters.category) {
    query = query.eq("categories.slug", filters.category);
  }

  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }

  const { data, count } = await query;

  const events = data ?? [];
  if (events.length > 0) {
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

    const eventsWithPrice = events.map((e) => ({
      ...e,
      priceRange: ticketMap.get(e.id) ?? { min: 0, max: 0 },
    }));

    if (filters.price === "free") {
      const freeEvents = eventsWithPrice.filter((e) => e.priceRange.min === 0);
      return {
        events: freeEvents,
        total: freeEvents.length,
        totalPages: Math.ceil(freeEvents.length / limit),
      };
    }

    if (filters.price === "paid") {
      const paidEvents = eventsWithPrice.filter((e) => e.priceRange.min > 0);
      return {
        events: paidEvents,
        total: paidEvents.length,
        totalPages: Math.ceil(paidEvents.length / limit),
      };
    }

    return {
      events: eventsWithPrice,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    };
  }

  return { events: [], total: 0, totalPages: 0 };
}

export async function getExploreCities() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("city")
    .eq("status", "published")
    .not("city", "is", null);

  const cities = [
    ...new Set(data?.map((e) => e.city).filter(Boolean)),
  ] as string[];
  return cities.sort();
}

export async function getExploreCategories() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return data ?? [];
}
