import { getDashboardStats } from "@/actions/stats";
import { getDashboardEvents } from "@/actions/events";
import { CalendarDays, Ticket, Users, TrendingUp, IndianRupee, UserCheck } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/utils/format";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const [stats, events] = await Promise.all([
    getDashboardStats(),
    getDashboardEvents(),
  ]);

  const overviewStats = [
    {
      label: "Total Revenue",
      value: `₹${((stats?.totalRevenue ?? 0) / 100).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
    {
      label: "Registrations",
      value: stats?.totalRegistrations ?? 0,
      icon: Users,
    },
    {
      label: "Checked In",
      value: stats?.totalCheckedIn ?? 0,
      icon: UserCheck,
    },
    {
      label: "Total Events",
      value: stats?.eventCount ?? events.length,
      icon: CalendarDays,
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
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

      {/* Recent Events */}
      {events.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Recent Events</h2>
          <div className="flex flex-col gap-3">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
              >
                <Link
                  href={`/dashboard/event/${event.id}/edit`}
                  className="flex flex-1 flex-col gap-1"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{event.title}</h3>
                    <Badge
                      variant={
                        event.status === "published" ? "default" : "secondary"
                      }
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.start_time, event.timezone)}
                    {(event.categories as any)?.name && ` · ${(event.categories as any).name}`}
                  </p>
                </Link>
                <Link
                  href={`/dashboard/event/${event.id}/stats`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <TrendingUp className="mr-1 size-4" />
                  Stats
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
