import { notFound } from "next/navigation";
import { getEventById, getEventTickets } from "@/actions/tickets";
import { EventEditHeader } from "@/components/event/event-edit-header";
import { TicketManager } from "@/components/event/ticket-manager";

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
      <TicketManager eventId={event.id} tickets={tickets} />
    </div>
  );
}
