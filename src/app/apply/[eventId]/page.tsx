import { notFound } from "next/navigation";
import {
  getEventForApplication,
  getApplicationFormFields,
  getMyApplication,
} from "@/actions/approvals";
import { ApplicationForm } from "@/components/forms/application-form";
import { ApplicationStatus } from "@/components/forms/application-status";

interface ApplyPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { eventId } = await params;
  const event = await getEventForApplication(eventId);

  if (!event) {
    notFound();
  }

  const [fields, existing] = await Promise.all([
    getApplicationFormFields(eventId),
    getMyApplication(eventId),
  ]);

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

  if (existing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <ApplicationStatus
          eventTitle={event.title}
          eventId={event.id}
          status={existing.status}
          submittedAt={existing.submitted_at}
        />
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
