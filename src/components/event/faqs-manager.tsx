"use client";

import { useEffect, useState, useTransition } from "react";
import { getEventFAQs, createFAQ, deleteFAQ } from "@/actions/faqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, HelpCircle } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export function FAQsManager({ eventId }: { eventId: string }) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  async function load() {
    const data = await getEventFAQs(eventId);
    setFaqs(data as FAQ[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [eventId]);

  function handleCreate() {
    if (!question.trim() || !answer.trim()) {
      setError("Both question and answer are required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await createFAQ(eventId, question, answer);
      setQuestion("");
      setAnswer("");
      load();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteFAQ(id, eventId);
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
        <HelpCircle className="size-5" />
        FAQ
      </h2>

      <div className="rounded-xl border p-4">
        <p className="mb-3 text-sm font-medium">Add FAQ</p>
        <Input placeholder="Question" className="mb-3" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <Textarea placeholder="Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <Button className="mt-3" onClick={handleCreate} disabled={isPending}>
          {isPending ? <Loader2 className="mr-1 size-4 animate-spin" /> : <Plus className="mr-1 size-4" />}
          Add FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No FAQs added yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {faqs.map((faq) => (
            <div key={faq.id} className="flex items-start justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Q: {faq.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">A: {faq.answer}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)} disabled={isPending}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
