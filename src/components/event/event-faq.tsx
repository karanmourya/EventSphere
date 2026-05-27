"use client";

import { useEffect, useState } from "react";
import { getEventFAQs } from "@/actions/faqs";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export function EventFAQ({ eventId }: { eventId: string }) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getEventFAQs(eventId).then((data) => setFaqs(data as FAQ[]));
  }, [eventId]);

  if (faqs.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">FAQ</h2>
      <div className="flex flex-col gap-2">
        {faqs.map((faq) => (
          <div key={faq.id} className="rounded-lg border">
            <button
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="font-medium">{faq.question}</span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  openId === faq.id && "rotate-180"
                )}
              />
            </button>
            {openId === faq.id && (
              <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
