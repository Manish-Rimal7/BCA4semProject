import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Users, Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { StatusPill } from "@/components/StatusPill";
import { InterestModal } from "@/components/InterestModal";
import { cn } from "@/lib/utils";

export function ItemCard({ item, onInterestToggle }: { item: any; onInterestToggle?: () => void }) {
  const { user } = useAuth();
  const id = item.UUID || item._id || item.id || "1";
  const title = item.productName || item.title || "Untitled";
  const category = item.productCategory || item.category || "General";
  const condition = item.condition || "Good";
  const location = item.location || "Local";
  const description = item.description || "";
  const image =
    item.productImage ||
    item.image ||
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=60";
  const status = item.status || "available";

  const interestedList = item.interestedUsers || [];
  const count = interestedList.length || item.requestCount || 0;

  const [interestedCount, setInterestedCount] = useState<number>(count);
  const [isInterested, setIsInterested] = useState<boolean>(() => {
    if (!user) return false;
    return interestedList.some((u: any) => {
      const uObj = u?.user || u;
      return (uObj._id || uObj.id || uObj) === user.id || uObj.mail === user.mail;
    });
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_URL = "http://localhost:8091/api";

  const executeToggleInterest = async (purpose?: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/products/toggleInterest/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ purpose }),
      });

      const data = await response.json();
      if (response.ok && (data.responseCode === 200 || data.responseCode === 201)) {
        const nextInterested = !isInterested;
        setIsInterested(nextInterested);
        setInterestedCount((prev) => (nextInterested ? prev + 1 : Math.max(0, prev - 1)));
        toast.success(nextInterested ? "Interest expressed with purpose!" : "Interest removed");
        setIsModalOpen(false);
        if (onInterestToggle) onInterestToggle();
      } else {
        toast.error(data.responseMessage || data.message || "Unable to update interest");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating interest");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to express interest in this item");
      return;
    }

    if (isInterested) {
      // Remove interest immediately
      executeToggleInterest();
    } else {
      // Open modal to enter purpose
      setIsModalOpen(true);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <Link to="/items/$id" params={{ id }} className="relative aspect-[4/3] overflow-hidden bg-muted block">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <StatusPill status={status} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>{category}</span>
          <span className="size-1 rounded-full bg-border" />
          <span>{condition}</span>
        </div>
        <Link to="/items/$id" params={{ id }}>
          <h3 className="text-base font-semibold leading-snug hover:text-primary transition-colors">{title}</h3>
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground border-t border-border/50">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {location.split(",")[0]}
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <Users className="size-3.5" />
            {interestedCount} interested
          </span>
        </div>

        <button
          type="button"
          onClick={handleButtonClick}
          disabled={loading}
          className={cn(
            "mt-2 flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all duration-200",
            isInterested
              ? "bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm"
              : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground border border-border/40"
          )}
        >
          <Heart className={cn("size-3.5", isInterested && "fill-current text-white")} />
          {isInterested ? "Interested" : "I'm Interested"}
        </button>
      </div>

      <InterestModal
        isOpen={isModalOpen}
        itemTitle={title}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(purpose) => executeToggleInterest(purpose)}
        loading={loading}
      />
    </div>
  );
}
