"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, Globe, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/utils/format";

interface EventInfoProps {
  event: {
    start_time: string;
    end_time: string;
    timezone: string;
    city: string | null;
    venue: string | null;
    online_link: string | null;
    visibility: string;
    registration_mode: string;
    categories: {
      name: string;
      slug: string;
    } | null;
  };
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function EventInfo({ event }: EventInfoProps) {
  const location = [event.venue, event.city].filter(Boolean).join(", ");

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="rounded-xl border bg-card p-6"
    >
      <h2 className="mb-4 text-lg font-semibold">Event Details</h2>

      <div className="flex flex-col gap-4">
        {/* Date & Time */}
        <motion.div variants={fadeUp} className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium">
              {formatDate(event.start_time, event.timezone)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatTime(event.start_time, event.timezone)} &ndash;{" "}
              {formatTime(event.end_time, event.timezone)}
            </p>
          </div>
        </motion.div>

        {/* Timezone */}
        <motion.div variants={fadeUp} className="flex items-start gap-3">
          <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <p className="text-sm">{event.timezone}</p>
        </motion.div>

        {/* Location */}
        {location && (
          <motion.div variants={fadeUp} className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{event.venue}</p>
              {event.city && (
                <p className="text-sm text-muted-foreground">{event.city}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Online Link */}
        {event.online_link && (
          <motion.div variants={fadeUp} className="flex items-start gap-3">
            <Globe className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <a
              href={event.online_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Join online
            </a>
          </motion.div>
        )}

        {/* Category & Tags */}
        <motion.div variants={fadeUp} className="flex items-center gap-2 pt-2">
          <Tag className="size-4 text-muted-foreground" />
          {event.categories && (
            <Badge variant="secondary">{event.categories.name}</Badge>
          )}
          <Badge variant="outline">{event.visibility}</Badge>
          <Badge variant="outline">{event.registration_mode}</Badge>
        </motion.div>
      </div>
    </motion.div>
  );
}
