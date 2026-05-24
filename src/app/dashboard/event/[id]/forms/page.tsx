import { notFound } from "next/navigation";
import { getEventForForm, getFormFields } from "@/actions/approvals";
import { FormBuilder } from "@/components/forms/form-builder";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FormBuilderPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormBuilderPage({ params }: FormBuilderPageProps) {
  const { id } = await params;
  const event = await getEventForForm(id);

  if (!event) {
    notFound();
  }

  const fields = await getFormFields(id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/dashboard/event/${id}/edit`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="mr-1 size-4" />
          Back
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Application Form
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build the form that attendees fill out to apply for{" "}
          <strong>{event.title}</strong>
        </p>
      </div>

      <FormBuilder eventId={event.id} initialFields={fields} />
    </div>
  );
}
