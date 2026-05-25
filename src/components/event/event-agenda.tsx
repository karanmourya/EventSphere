"use client";

import { useEffect, useState } from "react";
import { getAgenda } from "@/actions/agendas";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface AgendaItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
}

interface EventAgendaProps {
  eventId: string;
}

export function EventAgenda({ eventId }: EventAgendaProps) {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgenda(eventId).then((data) => {
      setItems(data as AgendaItem[]);
      setLoading(false);
    });
  }, [eventId]);

  if (loading || items.length === 0) return null;

  return (
    <div className="rounded-xl border border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Schedule</h3>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <Clock className="size-3.5 text-muted-foreground" />
              <div className="w-px flex-1 bg-border" />
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{item.title}</p>
                <Badge variant="secondary" className="text-xs">
                  {getDuration(item.start_time, item.end_time)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatTime(item.start_time)} — {formatTime(item.end_time)}
              </p>
              {item.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
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
