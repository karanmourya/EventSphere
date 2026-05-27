"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/actions/wishlist";
import { cn } from "@/lib/utils";

interface WishlistToggleProps {
  eventId: string;
  initialWishlisted: boolean;
  size?: "sm" | "md";
}

export function WishlistToggle({
  eventId,
  initialWishlisted,
  size = "md",
}: WishlistToggleProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await toggleWishlist(eventId);
      if (result.success) {
        setWishlisted(result.wishlisted);
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "rounded-full transition-colors hover:bg-white/80 dark:hover:bg-black/20",
        size === "sm" ? "p-1.5" : "p-2",
        isPending && "opacity-50"
      )}
    >
      <Heart
        className={cn(
          size === "sm" ? "size-4" : "size-5",
          wishlisted
            ? "fill-red-500 text-red-500"
            : "text-white/80 drop-shadow-sm"
        )}
      />
    </button>
  );
}
