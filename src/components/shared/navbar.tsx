"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  user: { id: string; email?: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          EventSphere
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/explore"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ size: "sm" }) + " hidden sm:inline-flex"}
              >
                Get started free
              </Link>
            </>
          )}
          <button
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link
              href="/explore"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Explore
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="px-3 py-2">
                  <NotificationBell />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className={buttonVariants({ size: "sm" }) + " mt-2"}
                  onClick={() => setOpen(false)}
                >
                  Get started free
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
