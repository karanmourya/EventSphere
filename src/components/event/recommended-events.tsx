"use client";

import { useEffect, useState } from "react";
import { getRecommendedEvents } from "@/actions/recommendations";
import { EventCard } from "@/components/event/event-card";
import { Sparkles } from "lucide-react";

interface EventSummary {
  id: string;
  title: string;
  city: string | null;
  category: string | null;
  short_description: string | null;
}

export function RecommendedEvents() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendedEvents().then((result) => {
      setEvents(result.events ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-muted-foreground animate-pulse" />
          <h2 className="text-lg font-semibold text-muted-foreground">
            Finding recommendations...
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-lg font-semibold">Recommended for You</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event, i) => (
          <EventCard key={event.id} event={event as any} index={i} />
        ))}
      </div>
    </div>
  );
}
