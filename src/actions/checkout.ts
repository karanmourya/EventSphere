"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface TicketSelection {
  ticketId: string;
  quantity: number;
}

export async function createOrder(
  eventId: string,
  selections: TicketSelection[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to register." };
  }

  const validSelections = selections.filter((s) => s.quantity > 0);
  if (validSelections.length === 0) {
    return { error: "Please select at least one ticket." };
  }

  // Fetch tickets to validate and calculate total
  const ticketIds = validSelections.map((s) => s.ticketId);
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .in("id", ticketIds);

  if (!tickets || tickets.length !== ticketIds.length) {
    return { error: "Invalid ticket selection." };
  }

  // Check availability
  for (const sel of validSelections) {
    const ticket = tickets.find((t) => t.id === sel.ticketId);
    if (!ticket) continue;
    if (ticket.remaining_quantity < sel.quantity) {
      return {
        error: `"${ticket.name}" only has ${ticket.remaining_quantity} tickets left.`,
      };
    }

    // Check sale end date
    if (ticket.sale_end_date) {
      const saleEnd = new Date(ticket.sale_end_date);
      if (saleEnd < new Date()) {
        return { error: `"${ticket.name}" sales have ended.` };
      }
    }
  }

  // Calculate total
  const totalAmount = validSelections.reduce((sum, sel) => {
    const ticket = tickets.find((t) => t.id === sel.ticketId)!;
    return sum + ticket.price * sel.quantity;
  }, 0);

  // Determine if this is free (all tickets free)
  const isFree = totalAmount === 0;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      event_id: eventId,
      total_amount: totalAmount,
      payment_status: isFree ? "completed" : "completed",
      payment_id: isFree ? null : `fake_${Date.now()}`,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: "Failed to create order. Please try again." };
  }

  // Create order items and registrations
  for (const sel of validSelections) {
    const ticket = tickets.find((t) => t.id === sel.ticketId)!;

    await supabase.from("order_items").insert({
      order_id: order.id,
      ticket_id: sel.ticketId,
      quantity: sel.quantity,
      price: ticket.price,
    });

    // Create registrations for each quantity
    for (let i = 0; i < sel.quantity; i++) {
      const qrCode = `${order.id}-${sel.ticketId}-${i}`;
      await supabase.from("registrations").insert({
        event_id: eventId,
        user_id: user.id,
        ticket_id: sel.ticketId,
        status: "approved",
        qr_code: qrCode,
      });
    }

    // Decrement remaining quantity (admin client bypasses RLS)
    const admin = createAdminClient();
    await admin
      .from("tickets")
      .update({
        remaining_quantity: ticket.remaining_quantity - sel.quantity,
      })
      .eq("id", sel.ticketId);
  }

  revalidatePath(`/dashboard/orders`);
  redirect(`/checkout/${eventId}/success?order=${order.id}`);
}

export async function getCheckoutEvent(eventId: string) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, profiles!events_organizer_id_fkey(name)")
    .eq("id", eventId)
    .single();

  if (!event) return null;

  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", eventId)
    .gt("remaining_quantity", 0)
    .order("price");

  return { ...event, tickets: tickets ?? [] };
}

export async function getOrder(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: order } = await supabase
    .from("orders")
    .select("*, events(title, slug, start_time, venue, city, profiles(name))")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*, tickets(name, ticket_type)")
    .eq("order_id", orderId);

  // Get registrations for this order's event + user
  const { data: registrations } = await supabase
    .from("registrations")
    .select("id, qr_code, checked_in, tickets(name, ticket_type)")
    .eq("event_id", order.event_id)
    .eq("user_id", user.id);

  return {
    ...order,
    items: items ?? [],
    registrations: registrations ?? [],
  };
}
