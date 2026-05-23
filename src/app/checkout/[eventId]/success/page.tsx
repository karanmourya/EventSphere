import Link from "next/link";
import { getOrder } from "@/actions/checkout";
import { CheckCircle, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/utils/format";
import { QRTicket } from "@/components/checkout/qr-ticket";

interface SuccessPageProps {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ order?: string }>;
}

export default async function SuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { eventId } = await params;
  const { order: orderId } = await searchParams;

  let order = null;
  if (orderId) {
    order = await getOrder(orderId);
  }

  const reg = order?.registrations?.[0];
  const event = order?.events as any;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="size-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          You are Registered!
        </h1>
        <p className="text-muted-foreground">
          Your tickets have been confirmed. Here is your QR ticket.
        </p>

        {order && (
          <div className="w-full rounded-xl border bg-card p-5 text-left">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Order</span>
              <span className="text-sm font-mono">{order.id.slice(0, 8)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm text-muted-foreground">Total Paid</span>
              <span className="font-semibold">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        )}

        {reg?.qr_code && event && (
          <div className="w-full">
            <p className="mb-2 text-sm text-muted-foreground">
              Show this QR at the venue
            </p>
            <QRTicket
              qrCode={reg.qr_code}
              event={{
                title: event.title ?? "",
                start_time: event.start_time ?? "",
                timezone: event.timezone ?? "",
                venue: event.venue ?? null,
                city: event.city ?? null,
              }}
              ticket={{
                name: (reg.tickets as any)?.name ?? "",
                ticket_type: (reg.tickets as any)?.ticket_type ?? "",
                price: 0,
              }}
            />
          </div>
        )}

        <div className="flex w-full flex-col gap-3 pt-4">
          <Link
            href="/dashboard/tickets"
            className={buttonVariants({ className: "w-full" })}
          >
            View All My Tickets
            <ArrowRight className="ml-1 size-4" />
          </Link>
          <Link
            href={event?.slug ? `/event/${event.slug}` : "/explore"}
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
          >
            Back to Event
          </Link>
        </div>
      </div>
    </div>
  );
}
