import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-7xl font-bold tracking-tighter text-muted-foreground/30">
        404
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className={buttonVariants({ variant: "outline" }) + " gap-2"}
        >
          <Home className="size-4" />
          Home
        </Link>
        <Link
          href="/explore"
          className={buttonVariants() + " gap-2"}
        >
          <ArrowLeft className="size-4" />
          Explore events
        </Link>
      </div>
    </div>
  );
}
