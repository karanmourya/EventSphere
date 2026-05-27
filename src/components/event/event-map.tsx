import { MapPin } from "lucide-react";

export function EventMap({
  venue,
  city,
}: {
  venue: string | null;
  city: string | null;
}) {
  if (!venue && !city) return null;

  const query = [venue, city].filter(Boolean).join(", ");
  const encodedQuery = encodeURIComponent(query);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Venue</h2>
      <div className="overflow-hidden rounded-xl border">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[300px] items-center justify-center bg-muted/50 transition-colors hover:bg-muted"
        >
          <div className="flex flex-col items-center gap-2">
            <MapPin className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">{query}</p>
            <p className="text-xs text-blue-600">Open in Google Maps</p>
          </div>
        </a>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{query}</p>
    </div>
  );
}
