"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, formatPrice } from "@/utils/format";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    banner_url: string | null;
    start_time: string;
    timezone: string;
    city: string | null;
    categories: { name: string } | null;
    profiles: {
      name: string;
      avatar_url: string | null;
    } | null;
    priceRange: { min: number; max: number };
  };
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const location = event.city;
  const priceLabel =
    event.priceRange.min === 0
      ? "Free"
      : event.priceRange.min === event.priceRange.max
        ? formatPrice(event.priceRange.min)
        : `From ${formatPrice(event.priceRange.min)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link
        href={`/event/${event.slug}`}
        className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      >
        {/* Banner */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {event.banner_url ? (
            <img
              src={event.banner_url}
              alt={event.title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/20 via-card to-muted">
              <CalendarDays className="size-10 text-muted-foreground/50" />
            </div>
          )}
          {event.categories && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 backdrop-blur-sm"
            >
              {event.categories.name}
            </Badge>
          )}
          <Badge
            className="absolute top-3 right-3"
            variant={event.priceRange.min === 0 ? "secondary" : "default"}
          >
            {priceLabel}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <h3 className="line-clamp-1 font-semibold leading-tight tracking-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {event.short_description}
          </p>
          <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              <span>
                {new Date(event.start_time).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  timeZone: event.timezone,
                })}
              </span>
            </div>
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
          {event.profiles && (
            <div className="flex items-center gap-2 border-t pt-2.5">
              <Avatar size="sm">
                {event.profiles.avatar_url && (
                  <AvatarImage src={event.profiles.avatar_url} />
                )}
                <AvatarFallback>
                  {event.profiles.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {event.profiles.name}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
