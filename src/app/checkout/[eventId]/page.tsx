import { notFound } from "next/navigation";
import { getCheckoutEvent } from "@/actions/checkout";
import { CheckoutForm } from "@/components/checkout/checkout-form";

interface CheckoutPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { eventId } = await params;
  const event = await getCheckoutEvent(eventId);

  if (!event || event.tickets.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Get Tickets
        </h1>
        <p className="mt-1 text-muted-foreground">{event.title}</p>
      </div>
      <CheckoutForm eventId={event.id} tickets={event.tickets} />
    </div>
  );
}
