"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get all organizer events
  const { data: events } = await supabase
    .from("events")
    .select("id")
    .eq("organizer_id", user.id);

  if (!events || events.length === 0) {
    return { totalRevenue: 0, totalRegistrations: 0, totalCheckedIn: 0, eventCount: 0 };
  }

  const eventIds = events.map((e) => e.id);

  // Total registrations across all events
  const { count: totalRegistrations } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .in("event_id", eventIds)
    .eq("status", "approved");

  // Total checked in
  const { count: totalCheckedIn } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .in("event_id", eventIds)
    .eq("status", "approved")
    .eq("checked_in", true);

  // Total revenue — sum all approved orders
  const { data: orders } = await supabase
    .from("orders")
    .select("total_amount")
    .in("event_id", eventIds)
    .eq("payment_status", "paid");

  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount ?? 0), 0) ?? 0;

  return {
    totalRevenue,
    totalRegistrations: totalRegistrations ?? 0,
    totalCheckedIn: totalCheckedIn ?? 0,
    eventCount: events.length,
  };
}

export async function getEventStats(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Verify ownership
  const { data: event } = await supabase
    .from("events")
    .select("*, categories(name)")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) return null;

  // Registrations by status
  const { count: totalRegistered } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "approved");

  const { count: totalCheckedIn } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "approved")
    .eq("checked_in", true);

  const { count: pendingCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "pending");

  // Revenue
  const { data: orders } = await supabase
    .from("orders")
    .select("total_amount, payment_status")
    .eq("event_id", eventId);

  const totalRevenue =
    orders
      ?.filter((o) => o.payment_status === "paid")
      .reduce((sum, o) => sum + (o.total_amount ?? 0), 0) ?? 0;
  const totalOrders = orders?.length ?? 0;

  // Ticket breakdown
  const { data: tickets } = await supabase
    .from("tickets")
    .select("id, name, ticket_type, price, quantity, remaining_quantity")
    .eq("event_id", eventId)
    .order("price");

  // Registration counts per ticket
  const ticketBreakdown = await Promise.all(
    (tickets ?? []).map(async (ticket) => {
      const { count } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .eq("ticket_id", ticket.id)
        .eq("status", "approved");

      return {
        ...ticket,
        registered: count ?? 0,
        sold: ticket.quantity - (ticket.remaining_quantity ?? 0),
      };
    })
  );

  return {
    event: {
      id: event.id,
      title: event.title,
      slug: event.slug,
      start_time: event.start_time,
      end_time: event.end_time,
      status: event.status,
      category: (event.categories as any)?.name,
    },
    totalRegistered: totalRegistered ?? 0,
    totalCheckedIn: totalCheckedIn ?? 0,
    pendingCount: pendingCount ?? 0,
    totalRevenue,
    totalOrders,
    ticketBreakdown,
  };
}

export async function exportAttendeesCSV(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Verify ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, title, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    return { error: "Not authorized." };
  }

  // Get all registrations with attendee and ticket info
  const { data: registrations } = await supabase
    .from("registrations")
    .select(
      "id, status, checked_in, qr_code, created_at, tickets(name, ticket_type, price), profiles(name, username)"
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (!registrations || registrations.length === 0) {
    return { error: "No registrations found." };
  }

  // Build CSV
  const headers = [
    "Name",
    "Username",
    "Ticket",
    "Ticket Type",
    "Price",
    "Status",
    "Checked In",
    "QR Code",
    "Registered At",
  ];

  const rows = registrations.map((reg) => {
    const profile = Array.isArray(reg.profiles)
      ? reg.profiles[0]
      : reg.profiles;
    const ticket = Array.isArray(reg.tickets)
      ? reg.tickets[0]
      : reg.tickets;

    return [
      profile?.name ?? "",
      profile?.username ?? "",
      ticket?.name ?? "",
      ticket?.ticket_type ?? "",
      ticket?.price ?? 0,
      reg.status,
      reg.checked_in ? "Yes" : "No",
      reg.qr_code ?? "",
      reg.created_at ? new Date(reg.created_at).toISOString() : "",
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          if (
            str.includes(",") ||
            str.includes('"') ||
            str.includes("\n")
          ) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    ),
  ].join("\n");

  return {
    success: true,
    filename: `${event.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-attendees.csv`,
    content: csvContent,
  };
}
