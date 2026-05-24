"use client";

import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/utils/format";

interface EventSidebarProps {
  event: {
    id: string;
    registration_mode: string;
    tickets: {
      id: string;
      name: string;
      price: number;
      ticket_type: string;
      remaining_quantity: number;
      quantity: number;
    }[];
  };
}

export function EventSidebar({ event }: EventSidebarProps) {
  const hasTickets = event.tickets.length > 0;
  const lowestPrice = hasTickets
    ? Math.min(...event.tickets.map((t) => t.price))
    : 0;
  const totalRemaining = event.tickets.reduce(
    (sum, t) => sum + t.remaining_quantity,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-xl border bg-card p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {hasTickets ? formatPrice(lowestPrice) : "Free"}
        </h3>
        {hasTickets && lowestPrice > 0 && (
          <span className="text-sm text-muted-foreground">onwards</span>
        )}
      </div>

      {/* Ticket tiers */}
      {hasTickets && (
        <div className="mb-5 flex flex-col gap-3">
          {event.tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-2">
                <Ticket className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{ticket.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.remaining_quantity} / {ticket.quantity} left
                  </p>
                </div>
              </div>
              <Badge variant={ticket.price === 0 ? "secondary" : "default"}>
                {formatPrice(ticket.price)}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Capacity indicator */}
      {hasTickets && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{totalRemaining} spots remaining</span>
            <span>
              {Math.round(
                (1 -
                  totalRemaining /
                    event.tickets.reduce((sum, t) => sum + t.quantity, 0)) *
                  100
              )}
              % filled
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.round(
                  (1 -
                    totalRemaining /
                      event.tickets.reduce((sum, t) => sum + t.quantity, 0)) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      <Link href={event.registration_mode === "approval" ? `/apply/${event.id}` : `/checkout/${event.id}`}>
        <Button className="w-full" size="lg">
          {event.registration_mode === "approval"
            ? "Apply to Attend"
            : event.registration_mode === "invite_only"
              ? "Request Invite"
              : hasTickets
                ? "Get Tickets"
                : "Register"}
        </Button>
      </Link>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {event.registration_mode === "approval"
          ? "Applications reviewed by organizer"
          : event.registration_mode === "invite_only"
            ? "Invite-only event"
            : "Free cancellation available"}
      </p>
    </motion.div>
  );
}
