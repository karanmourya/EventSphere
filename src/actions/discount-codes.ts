"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDiscountCode(
  eventId: string,
  data: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
    maxUses?: number;
    expiresAt?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Verify organizer ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    return { error: "Not authorized." };
  }

  if (data.type === "percentage" && data.value > 100) {
    return { error: "Percentage discount cannot exceed 100%." };
  }

  const { error } = await supabase.from("discount_codes").insert({
    event_id: eventId,
    code: data.code.toUpperCase().trim(),
    type: data.type,
    value: data.value,
    max_uses: data.maxUses ?? null,
    expires_at: data.expiresAt ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "This discount code already exists for this event." };
    }
    return { error: "Failed to create discount code." };
  }

  revalidatePath(`/dashboard/event/${eventId}/edit`);
  return { success: true };
}

export async function deleteDiscountCode(codeId: string, eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Verify organizer ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) {
    return { error: "Not authorized." };
  }

  await supabase.from("discount_codes").delete().eq("id", codeId);

  revalidatePath(`/dashboard/event/${eventId}/edit`);
  return { success: true };
}

export async function getDiscountCodes(eventId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function validateDiscountCode(eventId: string, code: string) {
  const supabase = await createClient();

  const { data: discount } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("event_id", eventId)
    .eq("code", code.toUpperCase().trim())
    .single();

  if (!discount) {
    return { error: "Invalid discount code." };
  }

  // Check expiry
  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return { error: "This discount code has expired." };
  }

  // Check max uses
  if (discount.max_uses && discount.current_uses >= discount.max_uses) {
    return { error: "This discount code has reached its usage limit." };
  }

  return {
    success: true,
    discount: {
      id: discount.id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
    },
  };
}

export async function getDiscountForCheckout(eventId: string, code: string) {
  const supabase = await createClient();

  const { data: discount } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("event_id", eventId)
    .eq("code", code.toUpperCase().trim())
    .single();

  if (!discount) return null;

  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return null;
  }

  if (discount.max_uses && discount.current_uses >= discount.max_uses) {
    return null;
  }

  return discount;
}
