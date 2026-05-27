import {
  getPublicEvents,
  getExploreCategories,
  getExploreCities,
} from "@/actions/explore";
import { getWishlistStatuses } from "@/actions/wishlist";
import { EventCard } from "@/components/event/event-card";
import { ExploreFilters } from "@/components/event/explore-filters";
import { RecommendedEvents } from "@/components/event/recommended-events";
import { CalendarDays } from "lucide-react";

interface ExplorePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    city?: string;
    price?: string;
    page?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const [result, categories, cities] = await Promise.all([
    getPublicEvents({
      search: params.search,
      category: params.category,
      city: params.city,
      price: params.price as "free" | "paid" | undefined,
      page: params.page ? parseInt(params.page, 10) : 1,
    }),
    getExploreCategories(),
    getExploreCities(),
  ]);

  const wishlistStatuses = await getWishlistStatuses(
    result.events.map((e) => e.id)
  );

  const hasFilters = params.search || params.category || params.city || params.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Explore Events</h1>
        <p className="mt-1 text-foreground/70">
          Discover events happening around you
        </p>
      </div>

      {!hasFilters && <RecommendedEvents />}

      <div className="mb-8">
        <ExploreFilters categories={categories} cities={cities} />
      </div>

      {result.events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
          <CalendarDays className="mb-4 size-12 text-muted-foreground/60" />
          <p className="text-lg font-medium text-foreground">
            No events found
          </p>
          <p className="mt-1 text-sm text-foreground/70">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-foreground/70">
            {result.total} event{result.total !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.events.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
                wishlisted={wishlistStatuses[event.id] ?? false}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
