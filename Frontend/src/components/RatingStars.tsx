import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  count,
  size = 16,
  interactive = false,
  onChange,
  className,
}: {
  value: number;
  count?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = value >= n - 0.25;
          const star = (
            <Star
              width={size}
              height={size}
              className={cn(
                "transition-colors",
                filled ? "fill-accent text-accent" : "text-border",
              )}
            />
          );
          return interactive ? (
            <button
              key={n}
              type="button"
              aria-label={`Rate ${n} out of 5`}
              onClick={() => onChange?.(n)}
              className="rounded-sm p-0.5 transition-transform hover:scale-110"
            >
              {star}
            </button>
          ) : (
            <span key={n}>{star}</span>
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">
          {value.toFixed(1)} · {count} ratings
        </span>
      )}
    </div>
  );
}
