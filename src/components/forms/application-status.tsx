"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface ApplicationStatusProps {
  eventTitle: string;
  eventId: string;
  status: string;
  submittedAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof Clock; description: string }
> = {
  pending: {
    label: "Pending Review",
    variant: "secondary",
    icon: Clock,
    description:
      "Your application has been submitted and is waiting for the organizer to review it.",
  },
  approved: {
    label: "Approved",
    variant: "default",
    icon: CheckCircle,
    description:
      "Congratulations! Your application has been approved. You can now attend the event.",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: XCircle,
    description:
      "Unfortunately, your application was not accepted at this time.",
  },
  waitlisted: {
    label: "Waitlisted",
    variant: "secondary",
    icon: Loader2,
    description:
      "You've been placed on the waitlist. The organizer may offer you a spot if one opens up.",
  },
};

export function ApplicationStatus({
  eventTitle,
  eventId,
  status,
  submittedAt,
}: ApplicationStatusProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border py-16 text-center">
      <Icon className="mb-4 size-12 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">
        Application {config.label}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{eventTitle}</p>
      <Badge variant={config.variant} className="mt-3">
        {config.label}
      </Badge>
      <p className="mt-4 max-w-sm text-sm text-muted-foreground">
        {config.description}
      </p>
      {status === "approved" && (
        <Link href={`/checkout/${eventId}`}>
          <Button className="mt-6" size="lg">
            Get Tickets
          </Button>
        </Link>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Submitted on {new Date(submittedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
