import { Star } from "lucide-react";

/** Accessible star rating. Color is not the only indicator — value is shown. */
export function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={
            i < rounded
              ? "h-4 w-4 fill-accent-500 text-accent-500"
              : "h-4 w-4 fill-navy-100 text-navy-200"
          }
        />
      ))}
    </div>
  );
}
