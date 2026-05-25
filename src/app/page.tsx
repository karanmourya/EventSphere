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
  Check,
} from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-32">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left — copy */}
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5" />
              AI-Native Event Platform
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[64px]" style={{ lineHeight: "1.05", letterSpacing: "-2px" }}>
              Events that
              <br />
              run themselves
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground/70">
              Create, manage, and scale events with AI-powered tools. From
              ticketing to check-in, EventSphere handles the operations so you
              can focus on the experience.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className={buttonVariants({ size: "lg" }) +
                  " h-10 gap-2 rounded-lg px-5 text-sm font-semibold"}
              >
                Start for free
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/explore"
                className={buttonVariants({ variant: "outline", size: "lg" }) +
                  " h-10 rounded-lg px-5 text-sm font-semibold"}
              >
                Explore events
              </Link>
            </div>

            <p className="mt-4 text-xs text-muted-foreground/60">
              No credit card required · Free for up to 100 attendees
            </p>
          </div>

          {/* Right — product mockup card */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.08)]">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <div className="size-2.5 rounded-full bg-red-400 opacity-60" />
                <div className="size-2.5 rounded-full bg-amber-400 opacity-60" />
                <div className="size-2.5 rounded-full bg-emerald-400 opacity-60" />
                <span className="ml-3 text-xs text-muted-foreground">
                  eventsphere.dev/dashboard
                </span>
              </div>
              {/* Mock dashboard content */}
              <div className="grid grid-cols-3 gap-3 p-5">
                <div className="flex flex-col gap-1.5 rounded-lg bg-background p-3.5">
                  <div className="text-[11px] text-muted-foreground">
                    Total Events
                  </div>
                  <div className="text-xl font-semibold text-foreground">
                    24
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted">
                    <div className="h-1 w-3/4 rounded-full bg-primary" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 rounded-lg bg-background p-3.5">
                  <div className="text-[11px] text-muted-foreground">
                    Registrations
                  </div>
                  <div className="text-xl font-semibold text-foreground">
                    1,847
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted">
                    <div className="h-1 w-5/6 rounded-full bg-emerald-500" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 rounded-lg bg-background p-3.5">
                  <div className="text-[11px] text-muted-foreground">
                    Revenue
                  </div>
                  <div className="text-xl font-semibold text-foreground">
                    ₹2.4L
                  </div>
                  <div className="h-1 w-full rounded-full bg-muted">
                    <div className="h-1 w-2/3 rounded-full bg-blue-500" />
                  </div>
                </div>
              </div>
              {/* Mock event list */}
              <div className="border-t border-border px-5 py-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-md bg-violet-100">
                      <CalendarDays className="size-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        DevConf 2026
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Jun 15 · Bangalore
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    Live
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-md bg-amber-100">
                      <CalendarDays className="size-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        Design Sprint
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Jul 3 · Mumbai
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                    Draft
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card">
        <div className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl" style={{ letterSpacing: "-1px" }}>
              Everything you need to run events
            </h2>
            <p className="mt-4 text-foreground/70">
              One platform for the entire event lifecycle — from planning to
              post-event analytics.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-xl bg-background p-8 transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.08)]"
              >
                <div className="mb-5 inline-flex size-10 items-center justify-center rounded-lg bg-card text-foreground">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-background">
        <div className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl" style={{ letterSpacing: "-1px" }}>
              Three steps. That&apos;s it.
            </h2>
            <p className="mt-4 text-foreground/70">
              Go from zero to a live event in minutes, not days.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/70">
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

      {/* Feature checklist */}
      <section className="bg-card">
        <div className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl" style={{ letterSpacing: "-1px" }}>
              Built for modern organizers
            </h2>
            <p className="mt-4 text-foreground/70">
              Every feature designed to save you time and delight your attendees.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="size-3 text-emerald-600" />
                </div>
                <p className="text-sm text-foreground/70">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-background">
        <div className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl bg-card p-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" style={{ letterSpacing: "-0.5px" }}>
              Ready to launch your next event?
            </h2>
            <p className="mt-4 text-foreground/70">
              Join thousands of organizers using EventSphere to create
              unforgettable experiences.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className={buttonVariants({ size: "lg" }) +
                  " h-10 gap-2 rounded-lg px-5 text-sm font-semibold"}
              >
                Get started — it&apos;s free
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — dark */}
      <footer className="bg-[#101010]">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <p className="text-base font-semibold text-white">EventSphere</p>
              <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa]">
                The AI-native event platform for communities, hackathons, and
                creators.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">
                Product
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                <li>
                  <Link
                    href="/explore"
                    className="text-sm text-[#a1a1aa] transition-colors hover:text-white"
                  >
                    Explore Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-[#a1a1aa] transition-colors hover:text-white"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">
                Platform
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                <li>
                  <Link
                    href="/dashboard"
                    className="text-sm text-[#a1a1aa] transition-colors hover:text-white"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-[#a1a1aa] transition-colors hover:text-white"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">
                Legal
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                <li>
                  <span className="text-sm text-[#a1a1aa]">Privacy Policy</span>
                </li>
                <li>
                  <span className="text-sm text-[#a1a1aa]">
                    Terms of Service
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-[#1a1a1a] pt-6">
            <p className="text-xs text-[#a1a1aa]">
              &copy; 2026 EventSphere. All rights reserved.
            </p>
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

const benefits = [
  "AI-generated event descriptions and schedules",
  "Instant QR code ticketing with check-in",
  "Custom application forms and approval workflows",
  "Real-time analytics and attendee management",
  "Multiple ticket tiers with inventory tracking",
  "Organizer dashboard with full event control",
  "Mobile-responsive event pages",
  "Free for up to 100 attendees",
];
