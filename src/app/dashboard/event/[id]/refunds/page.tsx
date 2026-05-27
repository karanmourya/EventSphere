"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { getEventRefundRequests, reviewRefundRequest } from "@/actions/refunds";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/utils/format";

export default function EventRefundsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function loadData() {
    const data = await getEventRefundRequests(eventId);
    setRequests(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [eventId]);

  function handleApprove(requestId: string) {
    startTransition(async () => {
      await reviewRefundRequest(requestId, "approved");
      loadData();
    });
  }

  function handleReject(requestId: string) {
    startTransition(async () => {
      await reviewRefundRequest(requestId, "rejected");
      setRejectingId(null);
      setRejectReason("");
      loadData();
    });
  }

  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Refund Requests</h1>
          <p className="text-sm text-muted-foreground">
            {pending.length} pending
          </p>
        </div>
        <Link
          href={`/dashboard/event/${eventId}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ArrowLeft className="mr-1 size-4" />
          Back to Event
        </Link>
      </div>

      {requests.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No refund requests yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {pending.map((req) => {
            const order = req.orders as any;
            const profile = order?.profiles as any;
            const items = order?.order_items as any[];

            return (
              <div
                key={req.id}
                className="rounded-xl border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {profile?.name ?? "Unknown"} ({profile?.username ?? "user"})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Order: {order?.total_amount ? formatPrice(order.total_amount) : "N/A"}
                      {" · "}
                      {items
                        ?.map((i: any) => `${i.tickets?.name ?? "Ticket"} x${i.quantity}`)
                        .join(", ") ?? ""}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Reason:</span> {req.reason}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                    <Clock className="mr-1 size-3" />
                    Pending
                  </Badge>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(req.id)}
                    disabled={isPending}
                  >
                    <CheckCircle2 className="mr-1 size-4" />
                    Approve
                  </Button>
                  {rejectingId === req.id ? (
                    <div className="flex flex-1 items-end gap-2">
                      <Textarea
                        placeholder="Reason (optional)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(req.id)}
                        disabled={isPending}
                      >
                        Confirm Reject
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectingId(req.id)}
                      disabled={isPending}
                    >
                      <XCircle className="mr-1 size-4" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {processed.length > 0 && (
            <>
              <h2 className="text-sm font-medium text-muted-foreground">
                Processed
              </h2>
              {processed.map((req) => {
                const order = req.orders as any;
                const profile = order?.profiles as any;

                return (
                  <div
                    key={req.id}
                    className="rounded-lg border bg-muted/30 p-3 opacity-75"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {profile?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order?.total_amount ? formatPrice(order.total_amount) : "N/A"}
                          {" · "}{req.reason}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          req.status === "approved"
                            ? "border-green-300 text-green-700"
                            : "border-red-300 text-red-700"
                        }
                      >
                        {req.status === "approved" ? (
                          <CheckCircle2 className="mr-1 size-3" />
                        ) : (
                          <XCircle className="mr-1 size-3" />
                        )}
                        {req.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
