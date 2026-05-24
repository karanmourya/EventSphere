"use client";

import { useState, useTransition } from "react";
import { submitApplication } from "@/actions/approvals";
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
} from "@/components/ui/field";
import { useRouter } from "next/navigation";

interface FieldData {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
  options: string[] | null;
}

interface ApplicationFormProps {
  eventId: string;
  fields: FieldData[];
}

export function ApplicationForm({ eventId, fields }: ApplicationFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  function updateAnswer(fieldId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate required fields
    for (const field of fields) {
      if (field.required && !answers[field.id]?.trim()) {
        setError(`"${field.label}" is required.`);
        return;
      }
    }

    const answerList = Object.entries(answers)
      .filter(([, val]) => val.trim())
      .map(([fieldId, answer]) => ({ fieldId, answer }));

    startTransition(async () => {
      const result = await submitApplication(eventId, answerList);
      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border py-16 text-center">
        <div className="mb-4 text-4xl">✅</div>
        <h2 className="text-xl font-semibold">Application Submitted</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your application has been sent to the organizer. You&apos;ll be
          notified when they review it.
        </p>
        <Button
          variant="ghost"
          className="mt-6"
          onClick={() => router.push("/dashboard/tickets")}
        >
          View My Applications
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        {fields.map((field) => (
          <Field key={field.id}>
            <FieldLabel>
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </FieldLabel>
            {renderFieldInput(field, answers[field.id] ?? "", (val) =>
              updateAnswer(field.id, val)
            )}
          </Field>
        ))}
      </FieldGroup>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}

function renderFieldInput(
  field: FieldData,
  value: string,
  onChange: (val: string) => void
) {
  switch (field.field_type) {
    case "textarea":
      return (
        <Textarea
          placeholder="Your answer..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
        />
      );
    case "select":
      return (
        <Select value={value} onValueChange={(val) => onChange(val ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    case "checkbox":
      return (
        <div className="flex flex-col gap-2">
          {field.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4"
                checked={value.split(",").includes(opt)}
                onChange={(e) => {
                  const current = value ? value.split(",").filter(Boolean) : [];
                  if (e.target.checked) {
                    onChange([...current, opt].join(","));
                  } else {
                    onChange(current.filter((v) => v !== opt).join(","));
                  }
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    default:
      return (
        <Input
          placeholder="Your answer..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
