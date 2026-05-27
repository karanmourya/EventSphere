"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWishlistedEvents } from "@/actions/wishlist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  CalendarDays,
  MapPin,
  Ticket,
  Loader2,
} from "lucide-react";
import { formatDate, formatPrice } from "@/utils/format";

export default function DashboardWishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlistedEvents().then((data) => {
      setWishlist(data);
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
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
        Wishlist
      </h1>
      <p className="mb-6 text-sm text-[var(--body)]">
        Events you are interested in
      </p>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--hairline)] py-16">
          <Heart className="mb-3 size-8 text-[var(--muted-soft)]" />
          <p className="text-[var(--body)]">Your wishlist is empty</p>
          <p className="text-sm text-[var(--muted-text)]">
            Heart events on the explore page to save them here.
          </p>
          <Link href="/explore">
            <Button variant="outline" size="sm" className="mt-4">
              Browse Events
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {wishlist.map((item) => {
            const event = item.events;
            if (!event) return null;
            const category = event.categories;

            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-[var(--hairline)] bg-[var(--canvas)] p-4"
              >
                <div className="aspect-[16/9] w-40 shrink-0 overflow-hidden rounded-lg">
                  {event.banner_url ? (
                    <img
                      src={event.banner_url}
                      alt={event.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-[var(--surface-card)]">
                      <CalendarDays className="size-6 text-[var(--muted-soft)]" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
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
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--body)]">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {formatDate(event.start_time, event.timezone)}
                      </span>
                      {event.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {event.city}
                        </span>
                      )}
                      {category?.name && (
                        <Badge variant="outline">{category.name}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--ink)]">
                      {event.priceRange?.min === 0
                        ? "Free"
                        : event.priceRange
                        ? `From ${formatPrice(event.priceRange.min)}`
                        : "Free"}
                    </span>
                    <Link href={`/event/${event.slug}`}>
                      <Button size="sm">
                        <Ticket className="mr-1 size-4" />
                        View Event
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
