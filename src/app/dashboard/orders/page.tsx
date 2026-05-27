"use client";

import { useEffect, useState, useTransition } from "react";
import { getUserOrders } from "@/actions/orders";
import { createRefundRequest, getUserRefundRequests } from "@/actions/refunds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingCart,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { formatPrice, formatDate } from "@/utils/format";

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [refundRequests, setRefundRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    const [ordersData, refundsData] = await Promise.all([
      getUserOrders(),
      getUserRefundRequests(),
    ]);
    setOrders(ordersData);
    setRefundRequests(refundsData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function getRefundStatus(orderId: string) {
    return refundRequests.find((r) => r.order_id === orderId);
  }

  function handleSubmitRefund(orderId: string) {
    if (!refundReason.trim()) {
      setError("Please provide a reason.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createRefundRequest(orderId, refundReason);
      if (result.error) {
        setError(result.error);
      } else {
        setDialogOpen(null);
        setRefundReason("");
        loadData();
      }
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
        Orders
      </h1>
      <p className="mb-6 text-sm text-[var(--body)]">
        Your ticket purchases and registrations
      </p>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--hairline)] py-16">
          <ShoppingCart className="mb-3 size-8 text-[var(--muted-soft)]" />
          <p className="text-[var(--body)]">No orders yet</p>
          <p className="text-sm text-[var(--muted-text)]">
            Your tickets will appear here after purchase.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const refund = getRefundStatus(order.id);
            const totalAmount = order.total_amount ?? 0;

            return (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-[var(--hairline)] bg-[var(--canvas)] p-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--ink)]">
                      {(order.events as any)?.title}
                    </h3>
                    <Badge
                      variant={
                        order.payment_status === "completed"
                          ? "default"
                          : order.payment_status === "refunded"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {order.payment_status}
                    </Badge>
                    {refund && (
                      <Badge
                        variant="outline"
                        className={`${
                          refund.status === "approved"
                            ? "border-green-300 text-green-700"
                            : refund.status === "rejected"
                            ? "border-red-300 text-red-700"
                            : "border-yellow-300 text-yellow-700"
                        }`}
                      >
                        {refund.status === "pending" && <Clock className="mr-1 size-3" />}
                        {refund.status === "approved" && <CheckCircle2 className="mr-1 size-3" />}
                        {refund.status === "rejected" && <XCircle className="mr-1 size-3" />}
                        Refund {refund.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-[var(--body)]">
                    {(order.events as any)?.start_time &&
                      formatDate(
                        (order.events as any).start_time,
                        (order.events as any).timezone
                      )}
                    {(order.events as any)?.venue &&
                      ` · ${(order.events as any).venue}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[var(--ink)]">
                    {totalAmount === 0
                      ? "Free"
                      : formatPrice(totalAmount)}
                  </span>
                  {totalAmount > 0 &&
                    order.payment_status === "completed" &&
                    !refund && (
                      <Dialog
                        open={dialogOpen === order.id}
                        onOpenChange={(open) => {
                          setDialogOpen(open ? order.id : null);
                          setError(null);
                          setRefundReason("");
                        }}
                      >
                        <DialogTrigger>
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="mr-1 size-3" />
                            Refund
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Request Refund</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                              {(order.events as any)?.title} &mdash;{" "}
                              {formatPrice(totalAmount)}
                            </p>
                            <Textarea
                              placeholder="Reason for refund request..."
                              value={refundReason}
                              onChange={(e) => setRefundReason(e.target.value)}
                            />
                            {error && (
                              <p className="text-sm text-red-600">{error}</p>
                            )}
                            <Button
                              onClick={() => handleSubmitRefund(order.id)}
                              disabled={isPending}
                            >
                              {isPending ? (
                                <Loader2 className="mr-1 size-4 animate-spin" />
                              ) : (
                                <RotateCcw className="mr-1 size-4" />
                              )}
                              Submit Request
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
