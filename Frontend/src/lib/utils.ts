import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string or timestamp into English date with Nepal Standard Time (UTC+05:45)
 * Example: "Sep 9, 2026, 12:55 PM"
 */
export function formatNepalDateTime(
  dateVal?: string | Date | number | null,
  options?: { includeTime?: boolean }
): string {
  if (!dateVal) return "Recently";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Recently";

  const includeTime = options?.includeTime ?? true;

  return d.toLocaleString("en-US", {
    timeZone: "Asia/Kathmandu",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      : {}),
  });
}

