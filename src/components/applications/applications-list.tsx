"use client";

import { useState, useTransition } from "react";
import { reviewApplication } from "@/actions/approvals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface ApplicationAnswer {
  id: string;
  answer: string;
  event_form_fields: { label: string } | null;
}

interface Application {
  id: string;
  status: string;
  submitted_at: string;
  profiles: {
    name: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    linkedin_url: string | null;
  } | null;
  answers: ApplicationAnswer[];
}

interface ApplicationsListProps {
  eventId: string;
  applications: Application[];
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  waitlisted: "secondary",
};

export function ApplicationsList({
  eventId,
  applications: initialApplications,
}: ApplicationsListProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReview(
    applicationId: string,
    status: "approved" | "rejected" | "waitlisted"
  ) {
    startTransition(async () => {
      const result = await reviewApplication(applicationId, status);
      if (result.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status } : app
          )
        );
      }
    });
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--hairline)] py-16">
        <p className="text-[var(--body)]">No applications yet</p>
        <p className="text-sm text-[var(--muted-text)]">
          Applications will appear here when attendees apply.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {applications.map((app) => {
        const isExpanded = expandedId === app.id;
        const profile = app.profiles;

        return (
          <div
            key={app.id}
            className="rounded-xl border bg-card overflow-hidden"
          >
            {/* Header row */}
            <button
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : app.id)}
            >
              <Avatar className="size-9">
                <AvatarFallback>
                  {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {profile?.name ?? "Unknown"}
                  </p>
                  <Badge variant={STATUS_VARIANT[app.status] ?? "secondary"}>
                    {app.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile?.username && `@${profile.username}`}
                  {" · "}
                  {new Date(app.submitted_at).toLocaleDateString()}
                </p>
              </div>
              {isExpanded ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t px-4 pb-4 pt-3">
                {/* Profile info */}
                {(profile?.bio || profile?.linkedin_url) && (
                  <div className="mb-4 rounded-lg bg-muted/50 p-3">
                    {profile.bio && (
                      <p className="text-sm">{profile.bio}</p>
                    )}
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-xs text-primary underline"
                      >
                        LinkedIn Profile
                      </a>
                    )}
                  </div>
                )}

                {/* Answers */}
                {app.answers.length > 0 && (
                  <div className="mb-4 flex flex-col gap-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Responses
                    </p>
                    {app.answers.map((answer) => (
                      <div key={answer.id}>
                        <p className="text-xs text-muted-foreground">
                          {answer.event_form_fields?.label ?? "Question"}
                        </p>
                        <p className="text-sm">{answer.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                {app.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReview(app.id, "approved")}
                      disabled={isPending}
                    >
                      <Check className="mr-1 size-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReview(app.id, "waitlisted")}
                      disabled={isPending}
                    >
                      <Clock className="mr-1 size-4" />
                      Waitlist
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReview(app.id, "rejected")}
                      disabled={isPending}
                    >
                      <X className="mr-1 size-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
