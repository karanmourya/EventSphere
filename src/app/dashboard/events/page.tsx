"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardEvents } from "@/actions/events";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Loader2 } from "lucide-react";
import { formatDate } from "@/utils/format";

export default function DashboardEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Events
          </h1>
          <p className="mt-1 text-sm text-[var(--body)]">
            Manage your events
          </p>
        </div>
        <Link
          href="/dashboard/event/create"
          className={buttonVariants({ size: "sm" })}
        >
          <Plus className="mr-1 size-4" />
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--hairline)] py-16">
          <p className="text-[var(--body)]">No events yet</p>
          <Link
            href="/dashboard/event/create"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "mt-4",
            })}
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-xl border border-[var(--hairline)] bg-[var(--canvas)] p-4 transition-colors hover:bg-[var(--surface-card)]"
            >
              <Link
                href={`/dashboard/event/${event.id}/edit`}
                className="flex flex-1 flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-[var(--ink)]">
                    {event.title}
                  </h3>
                  <Badge
                    variant={
                      event.status === "published" ? "default" : "secondary"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--body)]">
                  {formatDate(event.start_time, event.timezone)}
                  {event.categories?.name && ` · ${event.categories.name}`}
                </p>
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/event/${event.id}/stats`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <TrendingUp className="mr-1 size-4" />
                  Stats
                </Link>
                <span className="text-sm text-[var(--muted-text)]">
                  /event/{event.slug}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
