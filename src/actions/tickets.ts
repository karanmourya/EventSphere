"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TicketType } from "@/types";

interface CreateTicketInput {
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  ticketType: TicketType;
  saleEndDate?: string;
}

export async function createTicket(input: CreateTicketInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Verify the user owns this event
  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", input.eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    return { error: "You do not own this event." };
  }

  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({
      event_id: input.eventId,
      name: input.name,
      price: input.price,
      quantity: input.quantity,
      remaining_quantity: input.quantity,
      ticket_type: input.ticketType,
      sale_end_date: input.saleEndDate || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Failed to create ticket. Please try again." };
  }

  revalidatePath(`/dashboard/event/${input.eventId}/edit`);
  return { success: true, ticketId: ticket.id };
}

export async function getEventTickets(eventId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", eventId)
    .order("price");

  return data ?? [];
}

export async function getEventById(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("events")
    .select("*, categories(id, name, slug)")
    .eq("id", eventId)
    .single();

  if (!data || data.organizer_id !== user.id) return null;

  return data;
}

export async function deleteTicket(ticketId: string, eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in." };

  // Verify ownership through event
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, events!inner(organizer_id)")
    .eq("id", ticketId)
    .single();

  if (!ticket) return { error: "Ticket not found." };

  const { error } = await supabase.from("tickets").delete().eq("id", ticketId);

  if (error) return { error: "Failed to delete ticket." };

  revalidatePath(`/dashboard/event/${eventId}/edit`);
  return { success: true };
}
