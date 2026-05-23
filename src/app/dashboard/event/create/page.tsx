import { getCategories } from "@/actions/events";
import { CreateEventForm } from "@/components/forms/create-event-form";

export default async function CreateEventPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Event
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details to create your event.
        </p>
      </div>
      <CreateEventForm categories={categories} />
    </div>
  );
}
