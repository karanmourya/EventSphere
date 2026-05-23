"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserRegistrations() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("registrations")
    .select(`
      id,
      status,
      qr_code,
      checked_in,
      created_at,
      events(id, title, slug, start_time, end_time, timezone, venue, city, banner_url),
      tickets(id, name, ticket_type, price)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
