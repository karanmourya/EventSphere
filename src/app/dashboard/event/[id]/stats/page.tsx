"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEventStats, exportAttendeesCSV } from "@/actions/stats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserCheck,
  IndianRupee,
  ShoppingBag,
  Download,
  Loader2,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface EventStats {
  event: {
    id: string;
    title: string;
    slug: string;
    start_time: string;
    end_time: string;
    status: string;
    category: string;
  };
  totalRegistered: number;
  totalCheckedIn: number;
  pendingCount: number;
  totalRevenue: number;
  totalOrders: number;
  ticketBreakdown: {
    id: string;
    name: string;
    ticket_type: string;
    price: number;
    quantity: number;
    remaining_quantity: number;
    registered: number;
    sold: number;
  }[];
}

export default function EventStatsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getEventStats(eventId).then((data) => {
      setStats(data as EventStats | null);
      setLoading(false);
    });
  }, [eventId]);

  async function handleExport() {
    setExporting(true);
    const result = await exportAttendeesCSV(eventId);
    if (result.success && result.content) {
      const blob = new Blob([result.content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename ?? "attendees.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Event not found.</p>
        <Link href="/dashboard/events" className={buttonVariants({ variant: "link" })}>
          Back to Events
        </Link>
      </div>
    );
  }

  const revenueFormatted = `₹${(stats.totalRevenue / 100).toLocaleString("en-IN")}`;
  const checkInRate =
    stats.totalRegistered > 0
      ? Math.round((stats.totalCheckedIn / stats.totalRegistered) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {stats.event.title}
            </h1>
            <Badge
              variant={
                stats.event.status === "published" ? "default" : "secondary"
              }
            >
              {stats.event.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.event.category} &middot;{" "}
            {new Date(stats.event.start_time).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/event/${eventId}/checkin`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Check-in
          </Link>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Download className="mr-1 size-4" />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <IndianRupee className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{revenueFormatted}</p>
              <p className="text-sm text-muted-foreground">Revenue</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.totalRegistered}</p>
              <p className="text-sm text-muted-foreground">Registered</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
              <UserCheck className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {stats.totalCheckedIn}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({checkInRate}%)
                </span>
              </p>
              <p className="text-sm text-muted-foreground">Checked In</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10">
              <ShoppingBag className="size-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
              <p className="text-sm text-muted-foreground">Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending registrations */}
      {stats.pendingCount > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
          <Clock className="size-4" />
          {stats.pendingCount} registration{stats.pendingCount !== 1 ? "s" : ""} pending approval
        </div>
      )}

      <Separator className="my-6" />

      {/* Ticket Breakdown */}
      <h2 className="mb-4 text-lg font-semibold">Ticket Breakdown</h2>
      {stats.ticketBreakdown.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tickets created yet.</p>
      ) : (
        <div className="rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Sold</th>
                <th className="px-4 py-3 font-medium text-right">Capacity</th>
                <th className="px-4 py-3 font-medium text-right">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {stats.ticketBreakdown.map((ticket) => (
                <tr key={ticket.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{ticket.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {ticket.ticket_type.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ticket.price === 0
                      ? "Free"
                      : `₹${(ticket.price / 100).toLocaleString("en-IN")}`}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {ticket.registered}
                  </td>
                  <td className="px-4 py-3 text-right">{ticket.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    {ticket.remaining_quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Revenue breakdown */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Revenue by Ticket</h2>
        <div className="flex flex-col gap-2">
          {stats.ticketBreakdown
            .filter((t) => t.price > 0 && t.registered > 0)
            .map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-lg border bg-card p-3"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{ticket.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({ticket.registered} sold)
                  </span>
                </div>
                <span className="text-sm font-semibold">
                  ₹{((ticket.price * ticket.registered) / 100).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          {stats.ticketBreakdown.filter((t) => t.price > 0 && t.registered > 0)
            .length === 0 && (
            <p className="text-sm text-muted-foreground">
              No paid ticket sales yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
