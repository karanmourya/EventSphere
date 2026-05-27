"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import {
  checkInByQR,
  checkInManual,
  getCheckinStats,
  getRegistrationsForCheckin,
} from "@/actions/checkin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  QrCode,
  Search,
  UserCheck,
  Users,
  ScanLine,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface Registration {
  id: string;
  status: string;
  checked_in: boolean;
  qr_code: string;
  created_at: string;
  profiles: { name: string; username: string; avatar_url: string | null }[] | null;
  tickets: { name: string; ticket_type: string }[] | null;
}

export default function CheckinPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [stats, setStats] = useState<{
    eventTitle: string;
    totalRegistered: number;
    totalCheckedIn: number;
  } | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [statsData, regData] = await Promise.all([
      getCheckinStats(eventId),
      getRegistrationsForCheckin(eventId),
    ]);
    setStats(statsData);
    setRegistrations((regData as unknown as Registration[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [eventId]);

  function handleQRCheckin() {
    if (!qrInput.trim()) {
      setMessage({ text: "Please enter a QR code.", type: "error" });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await checkInByQR(eventId, qrInput.trim());
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: result.message ?? "Checked in!", type: "success" });
        setQrInput("");
        loadData();
      }
    });
  }

  function handleManualCheckin(registrationId: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await checkInManual(eventId, registrationId);
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: result.message ?? "Checked in!", type: "success" });
        loadData();
      }
    });
  }

  const getProfile = (r: Registration) => Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
  const getTicket = (r: Registration) => Array.isArray(r.tickets) ? r.tickets[0] : r.tickets;

  const filtered = registrations.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const profile = getProfile(r);
    const name = profile?.name?.toLowerCase() ?? "";
    const username = profile?.username?.toLowerCase() ?? "";
    return name.includes(q) || username.includes(q);
  });

  const notCheckedIn = filtered.filter((r) => !r.checked_in);
  const checkedIn = filtered.filter((r) => r.checked_in);

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
          <h1 className="text-2xl font-semibold tracking-tight">
            Check-in Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats?.eventTitle ?? "Event"}
          </p>
        </div>
        <Link
          href={`/dashboard/event/${eventId}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Back to Event
        </Link>
      </div>

      {/* Live Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {stats?.totalRegistered ?? 0}
              </p>
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
                {stats?.totalCheckedIn ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">Checked In</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Input */}
      <div className="mb-6 rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <ScanLine className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Scan / Enter QR Code</h2>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Paste or type QR code value..."
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQRCheckin()}
            className="font-mono"
          />
          <Button onClick={handleQRCheckin} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <QrCode className="size-4" />
            )}
            Check In
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <XCircle className="size-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <Separator className="my-6" />

      {/* Attendee List */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Attendees</h2>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Not Checked In */}
      {notCheckedIn.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Waiting ({notCheckedIn.length})
          </p>
          <div className="flex flex-col gap-2">
            {notCheckedIn.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center justify-between rounded-lg border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {getProfile(reg)?.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {getProfile(reg)?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{getProfile(reg)?.username ?? "unknown"} &middot;{" "}
                      {getTicket(reg)?.name ?? getTicket(reg)?.ticket_type ?? "Ticket"}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleManualCheckin(reg.id)}
                  disabled={isPending}
                >
                  Check In
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checked In */}
      {checkedIn.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Checked In ({checkedIn.length})
          </p>
          <div className="flex flex-col gap-2">
            {checkedIn.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center justify-between rounded-lg border bg-green-50 p-3 dark:bg-green-950/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                    {getProfile(reg)?.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {getProfile(reg)?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{getProfile(reg)?.username ?? "unknown"} &middot;{" "}
                      {getTicket(reg)?.name ?? getTicket(reg)?.ticket_type ?? "Ticket"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-400"
                >
                  <CheckCircle2 className="mr-1 size-3" />
                  Done
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && search && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No attendees matching &ldquo;{search}&rdquo;
        </p>
      )}

      {registrations.length === 0 && !search && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No approved registrations yet.
        </p>
      )}
    </div>
  );
}
