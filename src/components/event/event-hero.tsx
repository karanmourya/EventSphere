"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateRange } from "@/utils/format";

interface EventHeroProps {
  event: {
    title: string;
    short_description: string;
    banner_url: string | null;
    start_time: string;
    end_time: string;
    timezone: string;
    city: string | null;
    venue: string | null;
    profiles: {
      name: string;
      avatar_url: string | null;
    } | null;
  };
}

export function EventHero({ event }: EventHeroProps) {
  const location = [event.venue, event.city].filter(Boolean).join(", ");

  return (
    <div className="relative h-[480px] w-full overflow-hidden">
      {/* Banner */}
      {event.banner_url ? (
        <img
          src={event.banner_url}
          alt={event.title}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-card to-background" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              {event.short_description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4" />
                <span>
                  {formatDateRange(
                    event.start_time,
                    event.end_time,
                    event.timezone
                  )}
                </span>
              </div>
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            {event.profiles && (
              <div className="flex items-center gap-3 pt-1">
                <Avatar size="sm">
                  {event.profiles.avatar_url && (
                    <AvatarImage src={event.profiles.avatar_url} />
                  )}
                  <AvatarFallback>
                    {event.profiles.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  by{" "}
                  <span className="font-medium text-foreground">
                    {event.profiles.name}
                  </span>
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
