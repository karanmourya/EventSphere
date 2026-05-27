import { notFound } from "next/navigation";
import { getEventBySlug } from "@/actions/events";
import { isWishlisted } from "@/actions/wishlist";
import { EventHero } from "@/components/event/event-hero";
import { EventInfo } from "@/components/event/event-info";
import { EventDescription } from "@/components/event/event-description";
import { EventSidebar } from "@/components/event/event-sidebar";
import { EventAgenda } from "@/components/event/event-agenda";
import { EventReviews } from "@/components/event/event-reviews";
import { EventSpeakers } from "@/components/event/event-speakers";
import { EventMap } from "@/components/event/event-map";
import { EventFAQ } from "@/components/event/event-faq";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const wishlisted = await isWishlisted(event.id);

  return (
    <div className="min-h-screen">
      <EventHero event={event} wishlisted={wishlisted} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <EventInfo event={event} />
            {event.description && (
              <EventDescription description={event.description} />
            )}
            <EventSpeakers eventId={event.id} />
            <EventAgenda eventId={event.id} />
            <EventFAQ eventId={event.id} />
            <EventReviews eventId={event.id} eventSlug={event.slug} />
          </div>
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-6 sticky top-24">
              <EventSidebar event={event} />
              <EventMap venue={event.venue} city={event.city} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
