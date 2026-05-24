"use client";

import { useState, useTransition } from "react";
import { generateSchedule, saveAgenda, getAgenda } from "@/actions/agendas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Save, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

interface AgendaItem {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
}

interface ScheduleBuilderProps {
  eventId: string;
  eventTitle: string;
  startTime: string;
  endTime: string;
  description?: string;
  category?: string;
}

export function ScheduleBuilder({
  eventId,
  eventTitle,
  startTime,
  endTime,
  description,
  category,
}: ScheduleBuilderProps) {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function handleLoad() {
    const data = await getAgenda(eventId);
    if (data.length > 0) {
      setItems(
        data.map((d) => ({
          title: d.title,
          description: d.description ?? "",
          start_time: d.start_time,
          end_time: d.end_time,
        }))
      );
    }
    setLoaded(true);
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    setSaved(false);

    const result = await generateSchedule({
      title: eventTitle,
      category,
      startTime,
      endTime,
      description,
    });

    setIsGenerating(false);

    if (result.error) {
      setError(result.error);
    } else if (result.items) {
      setItems(result.items);
    }
  }

  function handleSave() {
    setError(null);
    startSave(async () => {
      const result = await saveAgenda(eventId, items);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  function handleRemove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleMove(index: number, direction: "up" | "down") {
    const next = [...items];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  }

  if (!loaded) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Event Schedule</h3>
            <p className="text-sm text-muted-foreground">
              Use AI to generate a schedule or build one manually.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLoad}>
            Load Schedule
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Event Schedule</h3>
          <p className="text-sm text-muted-foreground">
            {items.length} session{items.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="mr-1 size-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1 size-3.5" />
            )}
            {isGenerating ? "Generating..." : "AI Generate"}
          </Button>
          {items.length > 0 && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-1 size-3.5 animate-spin" />
              ) : (
                <Save className="mr-1 size-3.5" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {saved && (
        <p className="rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-600">
          Schedule saved!
        </p>
      )}

      {items.length === 0 && !isGenerating && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
          <p className="text-sm text-muted-foreground">
            No sessions yet. Click &quot;AI Generate&quot; to create a schedule.
          </p>
        </div>
      )}

      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatTime(item.start_time)} — {formatTime(item.end_time)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {getDuration(item.start_time, item.end_time)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => handleMove(i, "up")}
                disabled={i === 0}
              >
                <ChevronUp className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => handleMove(i, "down")}
                disabled={i === items.length - 1}
              >
                <ChevronDown className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive"
                onClick={() => handleRemove(i)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
          {item.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getDuration(start: string, end: string) {
  try {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(ms / 60000);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${mins}m`;
  } catch {
    return "";
  }
}
