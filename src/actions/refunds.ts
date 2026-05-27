"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createRefundRequest(orderId: string, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  if (!reason.trim()) {
    return { error: "Please provide a reason for the refund." };
  }

  // Verify order belongs to user and is paid
  const { data: order } = await supabase
    .from("orders")
    .select("id, event_id, user_id, payment_status")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== user.id) {
    return { error: "Order not found." };
  }

  if (order.payment_status !== "completed") {
    return { error: "Can only request refunds for completed orders." };
  }

  // Check no existing pending refund
  const { data: existing } = await supabase
    .from("refund_requests")
    .select("id")
    .eq("order_id", orderId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return { error: "A refund request is already pending for this order." };
  }

  const { error } = await supabase.from("refund_requests").insert({
    order_id: orderId,
    event_id: order.event_id,
    user_id: user.id,
    reason: reason.trim(),
  });

  if (error) return { error: "Failed to submit refund request." };

  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function reviewRefundRequest(
  requestId: string,
  action: "approved" | "rejected"
) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  // Get refund request with event info
  const { data: refundRequest } = await supabase
    .from("refund_requests")
    .select("*, events(organizer_id)")
    .eq("id", requestId)
    .single();

  if (!refundRequest) return { error: "Refund request not found." };

  const event = refundRequest.events as any;
  if (!event || event.organizer_id !== user.id) {
    return { error: "Not authorized." };
  }

  if (refundRequest.status !== "pending") {
    return { error: "This refund request has already been processed." };
  }

  // Update refund request status
  await supabase
    .from("refund_requests")
    .update({
      status: action,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  // If approved, mark order as refunded
  if (action === "approved") {
    await admin
      .from("orders")
      .update({ payment_status: "refunded" })
      .eq("id", refundRequest.order_id);
  }

  revalidatePath(`/dashboard/event/${refundRequest.event_id}/refunds`);
  return { success: true };
}

export async function getEventRefundRequests(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Verify ownership
  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || event.organizer_id !== user.id) return [];

  const { data: requests } = await supabase
    .from("refund_requests")
    .select(
      "*, orders(total_amount, payment_status, created_at, order_items(quantity, tickets(name)), profiles(name, username))"
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  return requests ?? [];
}

export async function getUserRefundRequests() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: requests } = await supabase
    .from("refund_requests")
    .select("*, events(title, slug), orders(total_amount)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return requests ?? [];
}
