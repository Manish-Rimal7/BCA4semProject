import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  fullHeight?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  text = "Loading...",
  className,
  size = "md",
  fullHeight = false,
}) => {
  const sizeMap = {
    sm: "size-5",
    md: "size-8",
    lg: "size-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300",
        fullHeight ? "min-h-[50vh]" : "py-16",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Ambient subtle glow pulse */}
        <div className="absolute -inset-2 rounded-full bg-emerald-500/15 blur-md animate-pulse" />

        {/* Outer subtle ring */}
        <div className="relative rounded-2xl bg-card border border-border/80 p-3.5 shadow-sm">
          <Loader2
            className={cn(
              "animate-spin text-emerald-600 dark:text-emerald-400",
              sizeMap[size]
            )}
          />
        </div>

        {/* Small sparkling corner accent */}
        <Sparkles className="absolute -top-1 -right-1 size-3.5 text-amber-500 animate-bounce" />
      </div>

      {text && (
        <div className="mt-4 space-y-1">
          <p className="text-sm font-semibold tracking-wide text-foreground/90">
            {text}
          </p>
          <p className="text-xs text-muted-foreground">
            Please wait a moment while we prepare your data
          </p>
        </div>
      )}
    </div>
  );
};

export default Loader;
