import { getDashboardEvents } from "@/actions/events";
import { CalendarDays, Ticket, Users, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const events = await getDashboardEvents();

  const stats = [
    {
      label: "Total Events",
      value: events.length,
      icon: CalendarDays,
    },
    {
      label: "Published",
      value: events.filter((e) => e.status === "published").length,
      icon: TrendingUp,
    },
    {
      label: "Drafts",
      value: events.filter((e) => e.status === "draft").length,
      icon: Ticket,
    },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        Dashboard
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Welcome back. Here is an overview of your events.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border bg-card p-5"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
