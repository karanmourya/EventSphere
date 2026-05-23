"use client";

import { useState, useTransition } from "react";
import { createOrder } from "@/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Ticket, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/utils/format";

interface TicketData {
  id: string;
  name: string;
  price: number;
  ticket_type: string;
  remaining_quantity: number;
}

interface CheckoutFormProps {
  eventId: string;
  tickets: TicketData[];
}

export function CheckoutForm({ eventId, tickets }: CheckoutFormProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateQty(ticketId: string, delta: number) {
    const ticket = tickets.find((t) => t.id === ticketId)!;
    const current = quantities[ticketId] || 0;
    const next = Math.max(0, Math.min(current + delta, ticket.remaining_quantity));
    setQuantities((prev) => ({ ...prev, [ticketId]: next }));
  }

  const total = tickets.reduce((sum, t) => {
    return sum + t.price * (quantities[t.id] || 0);
  }, 0);

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const isFree = total === 0;

  function handleSubmit() {
    if (totalTickets === 0) {
      setError("Please select at least one ticket.");
      return;
    }

    setError(null);
    const selections = tickets
      .filter((t) => (quantities[t.id] || 0) > 0)
      .map((t) => ({ ticketId: t.id, quantity: quantities[t.id] }));

    startTransition(async () => {
      const result = await createOrder(eventId, selections);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Ticket selection */}
      <div className="flex flex-col gap-4">
        {tickets.map((ticket) => {
          const qty = quantities[ticket.id] || 0;
          return (
            <div
              key={ticket.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Ticket className="size-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{ticket.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {ticket.ticket_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ticket.remaining_quantity} remaining
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {formatPrice(ticket.price)}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => updateQty(ticket.id, -1)}
                    disabled={qty === 0}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {qty}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => updateQty(ticket.id, 1)}
                    disabled={qty >= ticket.remaining_quantity}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order summary */}
      {(totalTickets > 0 || true) && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <ShoppingCart className="size-4" />
            Order Summary
          </h3>
          {tickets.map((ticket) => {
            const qty = quantities[ticket.id] || 0;
            if (qty === 0) return null;
            return (
              <div
                key={ticket.id}
                className="flex items-center justify-between py-1.5 text-sm"
              >
                <span className="text-muted-foreground">
                  {ticket.name} x {qty}
                </span>
                <span>{formatPrice(ticket.price * qty)}</span>
              </div>
            );
          })}
          <div className="mt-3 flex items-center justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span className="text-lg">{formatPrice(total)}</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={isPending || totalTickets === 0}
      >
        {isPending
          ? "Processing..."
          : isFree
            ? "Register Now"
            : `Pay ${formatPrice(total)}`}
      </Button>
      {!isFree && (
        <p className="text-center text-xs text-muted-foreground">
          Payment is simulated for now. Real Razorpay integration coming soon.
        </p>
      )}
    </div>
  );
}
