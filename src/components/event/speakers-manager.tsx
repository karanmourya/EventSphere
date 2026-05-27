"use client";

import { useEffect, useState, useTransition } from "react";
import { getEventSpeakers, createSpeaker, deleteSpeaker } from "@/actions/speakers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, Users, ExternalLink } from "lucide-react";

interface Speaker {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
}

export function SpeakersManager({ eventId }: { eventId: string }) {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");

  async function load() {
    const data = await getEventSpeakers(eventId);
    setSpeakers(data as Speaker[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [eventId]);

  function handleCreate() {
    if (!name.trim()) {
      setError("Speaker name is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await createSpeaker(eventId, {
        name,
        title: title || undefined,
        company: company || undefined,
        bio: bio || undefined,
        linkedinUrl: linkedin || undefined,
      });
      setName("");
      setTitle("");
      setCompany("");
      setBio("");
      setLinkedin("");
      load();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSpeaker(id, eventId);
      load();
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Users className="size-5" />
        Speakers
      </h2>

      {/* Add form */}
      <div className="rounded-xl border p-4">
        <p className="mb-3 text-sm font-medium">Add Speaker</p>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Title (e.g. Speaker, Panelist)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Company / Organization" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Input placeholder="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
        </div>
        <Textarea
          placeholder="Short bio..."
          className="mt-3"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <Button className="mt-3" onClick={handleCreate} disabled={isPending}>
          {isPending ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Plus className="mr-1 size-4" />}
          Add Speaker
        </Button>
      </div>

      {/* List */}
      {speakers.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No speakers added yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {speaker.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{speaker.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[speaker.title, speaker.company].filter(Boolean).join(" · ")}
                    {speaker.linkedin_url && (
                      <a href={speaker.linkedin_url} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600">
                        <ExternalLink className="inline size-3" />
                      </a>
                    )}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(speaker.id)} disabled={isPending}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
