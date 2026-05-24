import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  CalendarDays,
  Sparkles,
  QrCode,
  Users,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[40%] left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[128px]" />
        <div className="absolute -bottom-[20%] -left-[20%] h-[600px] w-[600px] rounded-full bg-chart-2/10 blur-[128px]" />
        <div className="absolute -right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-chart-3/10 blur-[128px]" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            AI-Native Event Platform
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block">Events that</span>
            <span className="block bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
              run themselves
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
            Create, manage, and scale events with AI-powered tools. From
            ticketing to check-in, EventSphere handles the operations so you
            can focus on the experience.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className={buttonVariants({ size: "lg" }) + " gap-2 px-8"}
            >
              Start for free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/explore"
              className={buttonVariants({ variant: "outline", size: "lg" }) + " px-8"}
            >
              Explore events
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required · Free for up to 100 attendees
          </p>
        </div>

        {/* Hero visual — mock dashboard */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="rounded-xl border border-border/50 bg-card/80 p-1 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
              <div className="size-2.5 rounded-full bg-destructive/60" />
              <div className="size-2.5 rounded-full bg-chart-4/60" />
              <div className="size-2.5 rounded-full bg-chart-3/60" />
              <span className="ml-3 text-xs text-muted-foreground">
                eventsphere.dev/dashboard
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6">
              <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-4">
                <div className="text-xs text-muted-foreground">Total Events</div>
                <div className="text-2xl font-bold">24</div>
                <div className="h-1.5 w-full rounded-full bg-primary/20">
                  <div className="h-1.5 w-3/4 rounded-full bg-primary" />
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-4">
                <div className="text-xs text-muted-foreground">Registrations</div>
                <div className="text-2xl font-bold">1,847</div>
                <div className="h-1.5 w-full rounded-full bg-chart-2/20">
                  <div className="h-1.5 w-5/6 rounded-full bg-chart-2" />
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-4">
                <div className="text-xs text-muted-foreground">Revenue</div>
                <div className="text-2xl font-bold">₹2.4L</div>
                <div className="h-1.5 w-full rounded-full bg-chart-3/20">
                  <div className="h-1.5 w-2/3 rounded-full bg-chart-3" />
                </div>
              </div>
            </div>
          </div>
          {/* Glow under the card */}
          <div className="absolute -bottom-8 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to run events
          </h2>
          <p className="mt-4 text-muted-foreground">
            One platform for the entire event lifecycle — from planning to
            post-event analytics.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative rounded-xl border border-border/50 bg-card/50 p-6 transition-colors hover:border-primary/30 hover:bg-card"
            >
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps. That&apos;s it.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Go from zero to a live event in minutes, not days.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-lg font-bold text-primary">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(100%+0.5rem)] top-6 hidden h-px w-[calc(100%-1rem)] bg-border sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-primary/20 bg-card p-12 text-center">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-[80px]" />
          <h2 className="relative text-3xl font-bold tracking-tight">
            Ready to launch your next event?
          </h2>
          <p className="relative mt-4 text-muted-foreground">
            Join thousands of organizers using EventSphere to create
            unforgettable experiences.
          </p>
          <div className="relative mt-8">
            <Link
              href="/signup"
              className={buttonVariants({ size: "lg" }) + " gap-2 px-8"}
            >
              Get started — it&apos;s free
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 EventSphere. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/explore"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Explore
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered",
    description:
      "Generate event descriptions, build schedules, and get smart recommendations — all powered by AI.",
  },
  {
    icon: QrCode,
    title: "QR Ticketing",
    description:
      "Instant QR code tickets with built-in check-in. No third-party tools needed.",
  },
  {
    icon: Users,
    title: "Approval Workflows",
    description:
      "Custom application forms, review dashboards, and approve/reject/waitlist flows.",
  },
  {
    icon: CalendarDays,
    title: "Smart Scheduling",
    description:
      "AI-generated agendas with session types, breaks, and speaker assignments.",
  },
  {
    icon: Zap,
    title: "Instant Checkout",
    description:
      "Seamless ticket purchasing with multiple tiers, pricing, and inventory management.",
  },
  {
    icon: Shield,
    title: "Organizer Dashboard",
    description:
      "Full control over events, tickets, applications, and attendee management.",
  },
];

const steps = [
  {
    title: "Create your event",
    description:
      "Set up your event with details, dates, and ticket tiers. AI helps write your description.",
  },
  {
    title: "Share & collect",
    description:
      "Publish your event, share the link, and watch registrations roll in.",
  },
  {
    title: "Run it smooth",
    description:
      "QR check-in, real-time dashboards, and AI-powered scheduling keep everything on track.",
  },
];
