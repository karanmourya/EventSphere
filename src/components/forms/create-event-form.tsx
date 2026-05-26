"use client";

import { useState, useTransition, useRef } from "react";
import { createEvent } from "@/actions/events";
import { generateDescription } from "@/actions/ai";
import { createClient } from "@/lib/supabase/client";
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
import { Sparkles, Loader2, Upload, X, ImageIcon } from "lucide-react";
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
  const [isUploading, setIsUploading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleBannerUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error: uploadError } = await supabase.storage
      .from("event-banners")
      .upload(path, file);

    setIsUploading(false);

    if (uploadError) {
      setError("Failed to upload image. Please try again.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("event-banners").getPublicUrl(data.path);

    setBannerUrl(publicUrl);
    setBannerPreview(publicUrl);
  }

  function handleRemoveBanner() {
    setBannerUrl(null);
    setBannerPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

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
        bannerUrl: bannerUrl || undefined,
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
            <FieldLabel>Banner Image</FieldLabel>
            {bannerPreview ? (
              <div className="relative overflow-hidden rounded-xl border">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="aspect-[16/9] w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors hover:border-foreground/30 hover:bg-muted/50"
              >
                {isUploading ? (
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                ) : (
                  <ImageIcon className="size-8 text-muted-foreground/60" />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {isUploading ? "Uploading..." : "Click to upload banner"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBannerUpload(file);
              }}
            />
            <FieldDescription>
              Recommended: 1200x675px (16:9 ratio)
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

      <Button type="submit" size="lg" className="w-full" disabled={isPending || isUploading}>
        {isPending ? "Creating..." : "Create Event"}
      </Button>
    </form>
  );
}
