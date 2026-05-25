import { notFound } from "next/navigation";
import { getCheckoutEvent } from "@/actions/checkout";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface CheckoutPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { eventId } = await params;
  const event = await getCheckoutEvent(eventId);

  if (!event || event.tickets.length === 0) {
    notFound();
  }

  const totalRemaining = event.tickets.reduce(
    (sum: number, t: { remaining_quantity: number }) => sum + t.remaining_quantity,
    0
  );

  if (totalRemaining === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Sold Out
          </h1>
          <p className="mt-2 text-foreground/70">
            All tickets for {event.title} have been sold.
          </p>
          <Link
            href={`/event/${event.slug}`}
            className={buttonVariants({ variant: "outline", className: "mt-6" })}
          >
            Back to Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Get Tickets
        </h1>
        <p className="mt-1 text-foreground/70">{event.title}</p>
      </div>
      <CheckoutForm eventId={event.id} tickets={event.tickets} />
    </div>
  );
}
