import { cn } from "@/lib/utils";

const map: Record<string, { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-primary text-primary-foreground" },
  reserved: { label: "Reserved", cls: "bg-accent text-accent-foreground" },
  given: { label: "Given away", cls: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", cls: "bg-accent text-accent-foreground" },
  accepted: { label: "Accepted", cls: "bg-primary text-primary-foreground" },
  declined: { label: "Declined", cls: "bg-destructive text-destructive-foreground" },
  completed: { label: "Completed", cls: "bg-secondary text-secondary-foreground" },
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const s = map[status] ?? { label: status, cls: "bg-secondary text-secondary-foreground" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide",
        s.cls,
        className,
      )}
    >
      {s.label}
    </span>
  );
}
