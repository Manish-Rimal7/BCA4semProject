import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Heart, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InterestModalProps {
  isOpen: boolean;
  itemTitle: string;
  onClose: () => void;
  onSubmit: (purpose: string) => Promise<void>;
  loading?: boolean;
}

export function InterestModal({
  isOpen,
  itemTitle,
  onClose,
  onSubmit,
  loading = false,
}: InterestModalProps) {
  const [purpose, setPurpose] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(purpose.trim());
    setPurpose("");
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Heart className="size-5 fill-current" />
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight">Express Interest</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">Item: {itemTitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="rounded-xl bg-muted/50 p-3.5 border border-border/50 text-xs text-muted-foreground flex items-start gap-2.5">
            <Sparkles className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Sharing your reason helps the item donor select the best recipient in our giving community!
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What is your purpose / why would you like this item?
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., I need this laptop for my college computer science assignments..."
              className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-full text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !purpose.trim()}
              className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold px-5"
            >
              {loading ? "Submitting..." : "Express Interest"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
