"use client";

import { useState, useTransition } from "react";
import {
  createFormField,
  deleteFormField,
} from "@/actions/approvals";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  AlignLeft,
  ListChecks,
  CheckSquare,
} from "lucide-react";
import type { FieldType } from "@/types";

interface FormFieldData {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
  options: string[] | null;
  display_order: number;
}

interface FormBuilderProps {
  eventId: string;
  initialFields: FormFieldData[];
}

const FIELD_TYPES: { value: FieldType; label: string; icon: typeof Type; description: string }[] = [
  { value: "text", label: "Short Text", icon: Type, description: "Single line answer" },
  { value: "textarea", label: "Long Text", icon: AlignLeft, description: "Multi-line answer" },
  { value: "select", label: "Dropdown", icon: ListChecks, description: "Choose from options" },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare, description: "Yes/No or multiple choice" },
];

export function FormBuilder({ eventId, initialFields }: FormBuilderProps) {
  const [fields, setFields] = useState(initialFields);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  // New field state
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [required, setRequired] = useState(false);
  const [optionsText, setOptionsText] = useState("");

  function resetForm() {
    setLabel("");
    setFieldType("text");
    setRequired(false);
    setOptionsText("");
  }

  function handleAddField(e: React.FormEvent) {
    e.preventDefault();

    const options =
      fieldType === "select" || fieldType === "checkbox"
        ? optionsText.split("\n").map((o) => o.trim()).filter(Boolean)
        : undefined;

    startTransition(async () => {
      const result = await createFormField(eventId, {
        label,
        fieldType,
        required,
        options,
      });

      if (result?.success) {
        setDialogOpen(false);
        resetForm();
        // Reload to get updated order
        window.location.reload();
      }
    });
  }

  function handleDelete(fieldId: string) {
    if (!confirm("Delete this field?")) return;

    startTransition(async () => {
      const result = await deleteFormField(fieldId, eventId);
      if (result?.success) {
        setFields((prev) => prev.filter((f) => f.id !== fieldId));
      }
    });
  }

  function getFieldIcon(fieldType: string) {
    const ft = FIELD_TYPES.find((f) => f.value === fieldType);
    return ft?.icon ?? Type;
  }

  function getFieldLabel(fieldType: string) {
    const ft = FIELD_TYPES.find((f) => f.value === fieldType);
    return ft?.label ?? fieldType;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {fields.length} field{fields.length !== 1 ? "s" : ""} in your form
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<button />}>
            <Button size="sm">
              <Plus className="mr-1 size-4" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Form Field</DialogTitle>
              <DialogDescription>
                Add a question to your application form.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddField} className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Field Type</FieldLabel>
                  <Select
                    value={fieldType}
                    onValueChange={(v) =>
                      setFieldType((v ?? "text") as FieldType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {FIELD_TYPES.map((ft) => (
                          <SelectItem key={ft.value} value={ft.value}>
                            {ft.label} - {ft.description}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Question / Label</FieldLabel>
                  <Input
                    placeholder="e.g. Why do you want to attend?"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    required
                  />
                </Field>
                {(fieldType === "select" || fieldType === "checkbox") && (
                  <Field>
                    <FieldLabel>Options (one per line)</FieldLabel>
                    <Textarea
                      placeholder={"Option 1\nOption 2\nOption 3"}
                      value={optionsText}
                      onChange={(e) => setOptionsText(e.target.value)}
                      rows={4}
                    />
                  </Field>
                )}
              </FieldGroup>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="size-4"
                />
                <label htmlFor="required" className="text-sm">
                  Required field
                </label>
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Adding..." : "Add Field"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
          <p className="text-muted-foreground">No form fields yet</p>
          <p className="text-sm text-muted-foreground">
            Add fields to build your application form.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((field) => {
            const Icon = getFieldIcon(field.field_type);
            return (
              <div
                key={field.id}
                className="flex items-center gap-3 rounded-xl border bg-card p-4"
              >
                <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{field.label}</p>
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getFieldLabel(field.field_type)}
                    {field.options && field.options.length > 0 &&
                      ` \u00B7 ${field.options.length} options`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(field.id)}
                  disabled={isPending}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
