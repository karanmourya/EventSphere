import { notFound } from "next/navigation";
import { getEventForForm, getApplicationFormFields } from "@/actions/approvals";
import { ApplicationForm } from "@/components/forms/application-form";

interface ApplyPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { eventId } = await params;
  const event = await getEventForForm(eventId);

  if (!event || event.registration_mode !== "approval") {
    notFound();
  }

  const fields = await getApplicationFormFields(eventId);

  if (fields.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">No Application Form</h1>
          <p className="mt-2 text-muted-foreground">
            The organizer hasn&apos;t set up an application form yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Apply for {event.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill out the application below. The organizer will review your
          submission.
        </p>
      </div>

      <ApplicationForm eventId={event.id} fields={fields} />
    </div>
  );
}
