"use client";

import { useState, useTransition } from "react";
import { createOrder } from "@/actions/checkout";
import { validateDiscountCode } from "@/actions/discount-codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Ticket, ShoppingCart, Tag, CheckCircle2, XCircle, Loader2 } from "lucide-react";
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

  // Discount code state
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: string;
    value: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  function updateQty(ticketId: string, delta: number) {
    const ticket = tickets.find((t) => t.id === ticketId)!;
    const current = quantities[ticketId] || 0;
    const next = Math.max(0, Math.min(current + delta, ticket.remaining_quantity));
    setQuantities((prev) => ({ ...prev, [ticketId]: next }));
  }

  const subtotal = tickets.reduce((sum, t) => {
    return sum + t.price * (quantities[t.id] || 0);
  }, 0);

  const discountAmount = appliedDiscount
    ? appliedDiscount.type === "percentage"
      ? Math.round(subtotal * (appliedDiscount.value / 100))
      : Math.min(appliedDiscount.value, subtotal)
    : 0;

  const total = Math.max(0, subtotal - discountAmount);
  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const isFree = total === 0;

  async function applyDiscount() {
    if (!discountInput.trim()) return;
    setDiscountError(null);
    setValidatingDiscount(true);

    const result = await validateDiscountCode(eventId, discountInput.trim());
    setValidatingDiscount(false);

    if (result.error) {
      setDiscountError(result.error);
      setAppliedDiscount(null);
    } else if (result.discount) {
      setAppliedDiscount(result.discount);
      setDiscountError(null);
    }
  }

  function removeDiscount() {
    setAppliedDiscount(null);
    setDiscountInput("");
    setDiscountError(null);
  }

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
      const result = await createOrder(
        eventId,
        selections,
        appliedDiscount?.code
      );
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Ticket selection */}
      <div className="flex flex-col gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center justify-between rounded-xl border p-4"
          >
            <div>
              <Badge variant="outline" className="capitalize">
                {ticket.ticket_type.replace("_", " ")}
              </Badge>
              <h3 className="mt-1 font-semibold">{ticket.name}</h3>
              <p className="text-sm text-muted-foreground">
                {ticket.price === 0
                  ? "Free"
                  : formatPrice(ticket.price)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => updateQty(ticket.id, -1)}
                disabled={!quantities[ticket.id]}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-6 text-center font-semibold">
                {quantities[ticket.id] || 0}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => updateQty(ticket.id, 1)}
                disabled={
                  (quantities[ticket.id] || 0) >= ticket.remaining_quantity
                }
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Discount Code */}
      <div className="rounded-xl border border-dashed p-4">
        <div className="mb-2 flex items-center gap-2">
          <Tag className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Discount Code</h3>
        </div>
        {appliedDiscount ? (
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              <span className="text-sm font-medium">
                {appliedDiscount.code} —{" "}
                {appliedDiscount.type === "percentage"
                  ? `${appliedDiscount.value}% off`
                  : formatPrice(appliedDiscount.value) + " off"}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={removeDiscount}>
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter code"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
              className="uppercase"
            />
            <Button
              variant="outline"
              onClick={applyDiscount}
              disabled={validatingDiscount || !discountInput.trim()}
            >
              {validatingDiscount ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
        )}
        {discountError && (
          <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
            <XCircle className="size-3" />
            {discountError}
          </p>
        )}
      </div>

      {/* Order Summary */}
      <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4">
        <h3 className="font-semibold">Order Summary</h3>
        {tickets.map((ticket) => {
          const qty = quantities[ticket.id] || 0;
          if (!qty) return null;
          return (
            <div
              key={ticket.id}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {ticket.name} x {qty}
              </span>
              <span>{formatPrice(ticket.price * qty)}</span>
            </div>
          );
        })}
        {appliedDiscount && discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <span>
              Discount ({appliedDiscount.code})
            </span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>{isFree ? "Free" : formatPrice(total)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={isPending || totalTickets === 0}
      >
        {isPending ? "Processing..." : isFree ? "Register Now" : "Complete Purchase"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Payment is simulated for now. Real Razorpay integration coming soon.
      </p>
    </div>
  );
}
