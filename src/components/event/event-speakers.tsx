"use client";

import { useEffect, useState } from "react";
import { getEventSpeakers } from "@/actions/speakers";
import { ExternalLink, User } from "lucide-react";

interface Speaker {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
}

export function EventSpeakers({ eventId }: { eventId: string }) {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  useEffect(() => {
    getEventSpeakers(eventId).then((data) => setSpeakers(data as Speaker[]));
  }, [eventId]);

  if (speakers.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Speakers</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="flex gap-4 rounded-xl border p-4"
          >
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              {speaker.avatar_url ? (
                <img
                  src={speaker.avatar_url}
                  alt={speaker.name}
                  className="size-full object-cover"
                />
              ) : (
                <User className="size-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold">{speaker.name}</p>
              {[speaker.title, speaker.company].filter(Boolean).join(" · ") && (
                <p className="text-sm text-muted-foreground">
                  {[speaker.title, speaker.company].filter(Boolean).join(" · ")}
                </p>
              )}
              {speaker.bio && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {speaker.bio}
                </p>
              )}
              {speaker.linkedin_url && (
                <a
                  href={speaker.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="size-3" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
