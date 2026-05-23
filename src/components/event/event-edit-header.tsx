import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatDate } from "@/utils/format";

interface EventEditHeaderProps {
  event: {
    id: string;
    title: string;
    slug: string;
    status: string;
    start_time: string;
    timezone: string;
    categories: { name: string } | null;
  };
}

export function EventEditHeader({ event }: EventEditHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {event.title}
            </h1>
            <Badge
              variant={event.status === "published" ? "default" : "secondary"}
            >
              {event.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(event.start_time, event.timezone)}
            {event.categories?.name && ` · ${event.categories.name}`}
          </p>
        </div>
        <Link
          href={`/event/${event.slug}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ExternalLink className="mr-1 size-4" />
          View
        </Link>
      </div>
    </div>
  );
}
