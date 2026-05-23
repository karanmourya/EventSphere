"use client";

import { useState, useTransition } from "react";
import { createTicket, deleteTicket } from "@/actions/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Ticket } from "lucide-react";
import { formatPrice } from "@/utils/format";
import type { TicketType } from "@/types";

interface TicketData {
  id: string;
  name: string;
  price: number;
  quantity: number;
  remaining_quantity: number;
  ticket_type: string;
  sale_end_date: string | null;
}

interface TicketManagerProps {
  eventId: string;
  tickets: TicketData[];
}

const TICKET_TYPES: { value: TicketType; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "general", label: "General" },
  { value: "vip", label: "VIP" },
  { value: "early_bird", label: "Early Bird" },
];

function CreateTicketDialog({
  eventId,
  onCreated,
}: {
  eventId: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [quantity, setQuantity] = useState("100");
  const [ticketType, setTicketType] = useState<TicketType>("general");
  const [saleEndDate, setSaleEndDate] = useState("");

  function resetForm() {
    setName("");
    setPrice("0");
    setQuantity("100");
    setTicketType("general");
    setSaleEndDate("");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createTicket({
        eventId,
        name,
        price: parseFloat(price) || 0,
        quantity: parseInt(quantity, 10),
        ticketType,
        saleEndDate: saleEndDate || undefined,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        resetForm();
        onCreated();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button />}>
        <Button size="sm">
          <Plus className="mr-1 size-4" />
          Add Ticket
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Ticket Tier</DialogTitle>
          <DialogDescription>
            Create a ticket type for your event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ticket-name">Ticket Name</FieldLabel>
              <Input
                id="ticket-name"
                placeholder="e.g. General Admission"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="ticket-price">Price (INR)</FieldLabel>
                <Input
                  id="ticket-price"
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="ticket-quantity">Quantity</FieldLabel>
                <Input
                  id="ticket-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>Ticket Type</FieldLabel>
              <Select
                value={ticketType}
                onValueChange={(v) =>
                  setTicketType((v ?? "general") as TicketType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TICKET_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="sale-end">Sale End Date (optional)</FieldLabel>
              <Input
                id="sale-end"
                type="datetime-local"
                value={saleEndDate}
                onChange={(e) => setSaleEndDate(e.target.value)}
              />
            </Field>
          </FieldGroup>
          {error && <FieldError>{error}</FieldError>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating..." : "Create Ticket"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TicketManager({ eventId, tickets: initialTickets }: TicketManagerProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [isPending, startTransition] = useTransition();

  function refreshTickets() {
    // Re-fetch by reloading the page data
    window.location.reload();
  }

  function handleDelete(ticketId: string) {
    if (!confirm("Delete this ticket tier?")) return;

    startTransition(async () => {
      const result = await deleteTicket(ticketId, eventId);
      if (result?.error) {
        alert(result.error);
      } else {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      }
    });
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tickets</h2>
          <p className="text-sm text-muted-foreground">
            Manage ticket tiers and pricing for your event.
          </p>
        </div>
        <CreateTicketDialog eventId={eventId} onCreated={refreshTickets} />
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
          <Ticket className="mb-3 size-8 text-muted-foreground" />
          <p className="text-muted-foreground">No tickets yet</p>
          <p className="text-sm text-muted-foreground">
            Add a ticket tier to start accepting registrations.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4"
            >
              <div className="flex items-center gap-4">
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
                    {ticket.remaining_quantity} / {ticket.quantity} remaining
                    {ticket.sale_end_date &&
                      ` · Ends ${new Date(ticket.sale_end_date).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">
                  {formatPrice(ticket.price)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(ticket.id)}
                  disabled={isPending}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
