"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";

interface QRTicketProps {
  qrCode: string;
  event: {
    title: string;
    start_time: string;
    timezone: string;
    venue: string | null;
    city: string | null;
  };
  ticket: {
    name: string;
    ticket_type: string;
    price: number;
  };
}

export function QRTicket({ qrCode, event, ticket }: QRTicketProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrCode, {
        width: 200,
        margin: 2,
        color: { dark: "#F9FAFB", light: "#111827" },
      });
      QRCode.toDataURL(qrCode, {
        width: 600,
        margin: 2,
        color: { dark: "#1E293B", light: "#FFFFFF" },
      }).then(setDataUrl);
    }
  }, [qrCode]);

  function handleDownload() {
    if (dataUrl) {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `ticket-${event.title.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
    }
  }

  const location = [event.venue, event.city].filter(Boolean).join(", ");

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <canvas
          ref={canvasRef}
          className="rounded-lg"
          style={{ width: 200, height: 200 }}
        />
        <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
          <div>
            <h3 className="font-semibold">{event.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(event.start_time, event.timezone)}
            </p>
            {location && (
              <p className="text-sm text-muted-foreground">{location}</p>
            )}
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Badge>{ticket.name}</Badge>
            <Badge variant="secondary">{ticket.ticket_type}</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="self-center sm:self-start"
          >
            <Download className="mr-1 size-4" />
            Download QR
          </Button>
        </div>
      </div>
    </div>
  );
}
