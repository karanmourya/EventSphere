import { getUserRegistrations } from "@/actions/tickets-display";
import { QRTicket } from "@/components/checkout/qr-ticket";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";

export default async function DashboardTicketsPage() {
  const registrations = await getUserRegistrations();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
        My Tickets
      </h1>
      <p className="mb-6 text-sm text-[var(--body)]">
        Your event tickets and QR codes
      </p>

      {registrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--hairline)] py-16">
          <Ticket className="mb-3 size-8 text-[var(--muted-soft)]" />
          <p className="text-[var(--body)]">No tickets yet</p>
          <p className="text-sm text-[var(--muted-text)]">
            Your tickets will appear here after registration.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {registrations.map((reg: any) => {
            const event = reg.events;
            const ticket = reg.tickets;
            if (!event || !reg.qr_code) return null;

            return (
              <div key={reg.id}>
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    variant={
                      reg.status === "approved" ? "default" : "secondary"
                    }
                  >
                    {reg.status}
                  </Badge>
                  {reg.checked_in && (
                    <Badge variant="outline">Checked In</Badge>
                  )}
                </div>
                <QRTicket
                  qrCode={reg.qr_code}
                  event={{
                    title: event.title,
                    start_time: event.start_time,
                    timezone: event.timezone,
                    venue: event.venue,
                    city: event.city,
                  }}
                  ticket={{
                    name: ticket?.name ?? "",
                    ticket_type: ticket?.ticket_type ?? "",
                    price: ticket?.price ?? 0,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
