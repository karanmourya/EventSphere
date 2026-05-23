import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface NavbarProps {
  user: { email?: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          EventSphere
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/explore"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ size: "sm" })}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
