"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, formatPrice } from "@/utils/format";
import { WishlistToggle } from "./wishlist-toggle";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    short_description: string | null;
    banner_url: string | null;
    start_time: string;
    timezone: string;
    city: string | null;
    categories: { name: string } | null;
    profiles: {
      name: string;
      avatar_url: string | null;
    } | null;
    priceRange?: { min: number; max: number };
  };
  index?: number;
  wishlisted?: boolean;
}

export function EventCard({ event, index = 0, wishlisted = false }: EventCardProps) {
  const location = event.city;
  const priceRange = event.priceRange ?? { min: 0, max: 0 };
  const priceLabel =
    priceRange.min === 0
      ? "Free"
      : priceRange.min === priceRange.max
        ? formatPrice(priceRange.min)
        : `From ${formatPrice(priceRange.min)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Link
        href={`/event/${event.slug}`}
        className="group flex flex-col overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--canvas)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
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
            <div className="flex size-full items-center justify-center bg-[var(--surface-card)]">
              <CalendarDays className="size-10 text-[var(--muted-soft)]" />
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
            className="absolute top-3 right-12"
            variant={priceRange.min === 0 ? "secondary" : "default"}
          >
            {priceLabel}
          </Badge>
          <div className="absolute top-2 right-2">
            <WishlistToggle eventId={event.id} initialWishlisted={wishlisted} size="sm" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <h3 className="line-clamp-1 font-semibold leading-tight tracking-tight text-[var(--ink)] transition-colors group-hover:text-[var(--brand-accent)]">
            {event.title}
          </h3>
          <p className="line-clamp-2 text-sm text-[var(--body)]">
            {event.short_description ?? ""}
          </p>
          <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-[var(--muted-text)]">
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
            <div className="flex items-center gap-2 border-t border-[var(--hairline-soft)] pt-2.5">
              <Avatar size="sm">
                {event.profiles.avatar_url && (
                  <AvatarImage src={event.profiles.avatar_url} />
                )}
                <AvatarFallback>
                  {event.profiles.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-[var(--muted-text)]">
                {event.profiles.name}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
