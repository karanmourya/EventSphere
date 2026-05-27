import { notFound } from "next/navigation";
import { getEventById, getEventTickets } from "@/actions/tickets";
import { EventEditHeader } from "@/components/event/event-edit-header";
import { TicketManager } from "@/components/event/ticket-manager";
import { ScheduleBuilder } from "@/components/event/schedule-builder";
import { DiscountManager } from "@/components/event/discount-manager";
import { SpeakersManager } from "@/components/event/speakers-manager";
import { FAQsManager } from "@/components/event/faqs-manager";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ClipboardList, ScanLine, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

      <div className="mb-6 flex gap-2">
        <Link
          href={`/dashboard/event/${id}/checkin`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ScanLine className="mr-1 size-4" />
          Check-in Panel
        </Link>
        <Link
          href={`/dashboard/event/${id}/refunds`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <RotateCcw className="mr-1 size-4" />
          Refunds
        </Link>
        {event.registration_mode === "approval" && (
          <>
            <Link
              href={`/dashboard/event/${id}/forms`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ClipboardList className="mr-1 size-4" />
              Edit Application Form
            </Link>
            <Link
              href={`/dashboard/event/${id}/applications`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ClipboardList className="mr-1 size-4" />
              View Applications
            </Link>
          </>
        )}
      </div>

      <TicketManager eventId={event.id} tickets={tickets} />

      <Separator className="my-8" />

      <ScheduleBuilder
        eventId={event.id}
        eventTitle={event.title}
        startTime={event.start_time}
        endTime={event.end_time}
        description={event.description ?? undefined}
        category={event.categories?.name}
      />

      <Separator className="my-8" />

      <DiscountManager eventId={event.id} />

      <Separator className="my-8" />

      <SpeakersManager eventId={event.id} />

      <Separator className="my-8" />

      <FAQsManager eventId={event.id} />
    </div>
  );
}
