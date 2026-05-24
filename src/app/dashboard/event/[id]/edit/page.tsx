import { notFound } from "next/navigation";
import { getEventById, getEventTickets } from "@/actions/tickets";
import { EventEditHeader } from "@/components/event/event-edit-header";
import { TicketManager } from "@/components/event/ticket-manager";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const tickets = await getEventTickets(event.id);

  return (
    <div className="mx-auto max-w-3xl">
      <EventEditHeader event={event} />

      {event.registration_mode === "approval" && (
        <div className="mb-6">
          <Link
            href={`/dashboard/event/${id}/applications`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ClipboardList className="mr-1 size-4" />
            View Applications
          </Link>
        </div>
      )}

      <TicketManager eventId={event.id} tickets={tickets} />
    </div>
  );
}
