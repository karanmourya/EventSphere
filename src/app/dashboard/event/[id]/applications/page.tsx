import { notFound } from "next/navigation";
import { getEventById } from "@/actions/tickets";
import { getApplications } from "@/actions/approvals";
import { ApplicationsList } from "@/components/applications/applications-list";
import { EventEditHeader } from "@/components/event/event-edit-header";

interface ApplicationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationsPage({
  params,
}: ApplicationsPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event || event.registration_mode !== "approval") {
    notFound();
  }

  const applications = await getApplications(event.id);

  return (
    <div className="mx-auto max-w-3xl">
      <EventEditHeader event={event} />
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Applications</h2>
        <p className="text-sm text-muted-foreground">
          {applications.length} application{applications.length !== 1 ? "s" : ""} received
        </p>
      </div>
      <ApplicationsList eventId={event.id} applications={applications} />
    </div>
  );
}
