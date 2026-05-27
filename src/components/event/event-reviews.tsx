"use client";

import { useEffect, useState, useTransition } from "react";
import { Star, Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getEventReviews,
  getUserReview,
  createReview,
  deleteReview,
  hasUserAttended,
} from "@/actions/reviews";

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profiles: { name: string; username: string; avatar_url: string | null }[] | null;
}

function StarRating({
  rating,
  onRate,
  readonly,
}: {
  rating: number;
  onRate?: (r: number) => void;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer"}`}
        >
          <Star
            className={`size-5 transition-colors ${
              star <= (hover || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function EventReviews({
  eventId,
  eventSlug,
}: {
  eventId: string;
  eventSlug: string;
}) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [userReview, setUserReview] = useState<{
    id: string;
    rating: number;
    comment: string | null;
  } | null>(null);
  const [hasAttended, setHasAttended] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  async function loadData() {
    const [reviewData, userData, attended] = await Promise.all([
      getEventReviews(eventId),
      getUserReview(eventId),
      hasUserAttended(eventId),
    ]);

    setReviews(reviewData.reviews as ReviewData[]);
    setAverage(reviewData.average);
    setCount(reviewData.count);
    setUserReview(userData);
    setHasAttended(attended);
    if (userData) {
      setRating(userData.rating);
      setComment(userData.comment ?? "");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [eventId]);

  function handleSubmit() {
    if (!rating) return;
    startTransition(async () => {
      const result = await createReview(eventId, rating, comment);
      if (result.success) {
        loadData();
      }
    });
  }

  function handleDelete() {
    if (!userReview) return;
    startTransition(async () => {
      await deleteReview(userReview.id, eventId);
      setRating(0);
      setComment("");
      loadData();
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {count > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-sm dark:bg-yellow-950">
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{average}</span>
            <span className="text-muted-foreground">({count})</span>
          </div>
        )}
      </div>

      {/* Review form - only for attendees */}
      {hasAttended && (
        <div className="rounded-xl border p-4">
          <p className="mb-3 text-sm font-medium">
            {userReview ? "Update your review" : "Leave a review"}
          </p>
          <StarRating rating={rating} onRate={setRating} />
          <Textarea
            placeholder="Share your experience (optional)..."
            className="mt-3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!rating || isPending}
            >
              {isPending ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <Send className="mr-1 size-4" />
              )}
              {userReview ? "Update" : "Submit"}
            </Button>
            {userReview && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="mr-1 size-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No reviews yet. Be the first to share your experience!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => {
            const profile = Array.isArray(review.profiles)
              ? review.profiles[0]
              : review.profiles;

            return (
              <div key={review.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {profile?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {profile?.name ?? "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} readonly />
                </div>
                {review.comment && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
