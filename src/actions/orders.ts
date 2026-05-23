"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("orders")
    .select("*, events(title, slug, start_time, venue, city)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
