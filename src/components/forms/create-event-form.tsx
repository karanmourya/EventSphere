"use client";

import { useState, useTransition } from "react";
import { createEvent } from "@/actions/events";
import { generateDescription } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import { Sparkles, Loader2 } from "lucide-react";
import type { EventVisibility, RegistrationMode } from "@/types";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CreateEventFormProps {
  categories: Category[];
}

export function CreateEventForm({ categories }: CreateEventFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerateDescription() {
    if (!title.trim()) {
      setError("Enter a title first so AI has something to work with.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    const result = await generateDescription({
      title,
      category: categories.find((c) => c.id === categoryId)?.name,
      city,
      venue,
      startTime,
      endTime,
    });
    setIsGenerating(false);
    if (result.error) {
      setError(result.error);
    } else if (result.description) {
      setDescription(result.description);
    }
  }

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [onlineLink, setOnlineLink] = useState("");
  const [visibility, setVisibility] = useState<EventVisibility>("public");
  const [registrationMode, setRegistrationMode] =
    useState<RegistrationMode>("open");

  function generateSlug(value: string) {
    const s = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(s);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createEvent({
        title,
        shortDescription,
        description: description || undefined,
        categoryId: categoryId || undefined,
        startTime,
        endTime,
        timezone,
        city: city || undefined,
        venue: venue || undefined,
        onlineLink: onlineLink || undefined,
        visibility,
        registrationMode,
      });

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Basic Info */}
      <section>
        <h2 className="mb-4 text-lg font-medium">Basic Info</h2>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="title">Event Title</FieldLabel>
            <Input
              id="title"
              placeholder="DevFest Delhi 2026"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                generateSlug(e.target.value);
              }}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="slug">URL Slug</FieldLabel>
            <Input
              id="slug"
              placeholder="devfest-delhi-2026"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <FieldDescription>
              eventsphere.com/event/{slug || "your-event"}
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="short-description">
              Short Description
            </FieldLabel>
            <Input
              id="short-description"
              placeholder="A one-line description of your event"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
            />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="description">
                Full Description
              </FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="mr-1 size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="mr-1 size-3.5" />
                )}
                {isGenerating ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Textarea
              id="description"
              placeholder="Tell attendees what to expect..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </Field>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </section>

      <FieldSeparator>Event Details</FieldSeparator>

      <section>
        <h2 className="mb-4 text-lg font-medium">Date & Location</h2>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="start-time">Start</FieldLabel>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="end-time">End</FieldLabel>
              <Input
                id="end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              placeholder="New Delhi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="venue">Venue</FieldLabel>
            <Input
              id="venue"
              placeholder="Convention Center, Hall 3"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="online-link">Online Link</FieldLabel>
            <Input
              id="online-link"
              type="url"
              placeholder="https://meet.google.com/..."
              value={onlineLink}
              onChange={(e) => setOnlineLink(e.target.value)}
            />
            <FieldDescription>
              For hybrid or online-only events
            </FieldDescription>
          </Field>
        </FieldGroup>
      </section>

      <FieldSeparator>Settings</FieldSeparator>

      <section>
        <h2 className="mb-4 text-lg font-medium">Event Settings</h2>
        <FieldGroup>
          <Field>
            <FieldLabel>Visibility</FieldLabel>
            <Select
              value={visibility}
              onValueChange={(v) => setVisibility((v ?? "public") as EventVisibility)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="public">
                    Public &mdash; listed on explore
                  </SelectItem>
                  <SelectItem value="unlisted">
                    Unlisted &mdash; only via link
                  </SelectItem>
                  <SelectItem value="private">
                    Private &mdash; invite only
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Registration Mode</FieldLabel>
            <Select
              value={registrationMode}
              onValueChange={(v) =>
                setRegistrationMode((v ?? "open") as RegistrationMode)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="open">
                    Open &mdash; anyone can register
                  </SelectItem>
                  <SelectItem value="approval">
                    Approval &mdash; review applications
                  </SelectItem>
                  <SelectItem value="invite_only">
                    Invite Only &mdash; selected attendees
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </section>

      {error && <FieldError>{error}</FieldError>}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Event"}
      </Button>
    </form>
  );
}
