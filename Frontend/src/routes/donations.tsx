import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { ItemCard } from "@/components/ItemCard";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  Package,
  Plus,
  CheckCircle,
  Clock,
  Heart,
  Trash2,
  Gift,
  ArrowRight,
} from "lucide-react";
import { API_BASE_URL as API_URL } from "@/config/api";

export const Route = createFileRoute("/donations")({
  head: () => ({
    meta: [{ title: "My Donations — Re-Nest" }],
  }),
  component: () => (
    <ProtectedRoute>
      <MyDonationsPage />
    </ProtectedRoute>
  ),
});

function MyDonationsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchedRef = useRef(false);

  const fetchDonations = async () => {
    const token = localStorage.getItem("Re-Nest.token") || localStorage.getItem("token");
    if (!token) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch directly from the dedicated donations endpoint
      const res = await fetch(`${API_URL}/donations/myDonations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data && (data.responseCode === 200 || data.responseCode === 201)) {
        const payload = data.responseData || data;
        setProducts(payload.products || []);
      } else {
        toast.error(data?.responseMessage || "Failed to load donations");
      }
    } catch (err) {
      console.error("fetchDonations error:", err);
      toast.error("Error loading donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchDonations();
  }, []);

  const handleDelete = async (uuid: string) => {
    if (!confirm("Are you sure you want to delete this donation listing?")) return;
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/products/deleteProduct/${uuid}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (response.ok) {
        toast.success("Product deleted successfully");
        fetchDonations();
      } else {
        toast.error(resData.responseMessage || "Failed to delete product");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product");
    }
  };

  const handleGiveItem = async (
    uuid: string,
    recipientId: string,
    recipientName: string,
    maxQty: number = 1
  ) => {
    let quantityToGive = 1;
    if (maxQty > 1) {
      const input = window.prompt(
        `How many units would you like to give to ${recipientName}? (1 to ${maxQty} available)`,
        "1"
      );
      if (!input) return;
      quantityToGive = Math.max(1, Math.min(parseInt(input, 10) || 1, maxQty));
    } else {
      if (!confirm(`Are you sure you want to give this item to ${recipientName}?`)) return;
    }

    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/products/giveProduct/${uuid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId, quantityToGive }),
      });
      const resData = await response.json();
      if (response.ok) {
        toast.success(
          resData.responseMessage ||
            `🎉 Successfully assigned ${quantityToGive} unit(s) to ${recipientName}!`
        );
        fetchDonations();
      } else {
        toast.error(resData.responseMessage || "Failed to assign item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error assigning item");
    }
  };

  if (loading) {
    return <Loader text="Loading your donations…" fullHeight />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="size-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Donations</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            All the items you have offered to your community ({products.length} listed). Select a recipient to gift items.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/dashboard">
              Activity History <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/donate">
              <Plus className="mr-2 size-4" /> Donate New Item
            </Link>
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Package className="mx-auto size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No donations listed yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            Share pre-loved items with your neighbours and give them a second life!
          </p>
          <Button asChild className="mt-5 rounded-full">
            <Link to="/donate">Donate an Item</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p: any) => (
            <div
              key={p.UUID || p._id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  {p.isApproved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="size-3.5" /> Approved & Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Clock className="size-3.5" /> Pending Approval
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(p.UUID)}
                    className="text-xs text-destructive hover:underline font-medium flex items-center gap-1"
                  >
                    <Trash2 className="size-3" /> Delete
                  </button>
                </div>

                <ItemCard item={p} onInterestToggle={fetchDonations} />

                {/* Given To Banner */}
                {p.givenTo && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-2.5 text-emerald-900 dark:text-emerald-300">
                    <div className="flex items-center gap-2 text-xs font-semibold min-w-0">
                      <CheckCircle className="size-4 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        Gifted to {p.givenTo.username || "Neighbour"}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                      Gifted
                    </span>
                  </div>
                )}

                {/* Interested Neighbours Section */}
                <div className="mt-3 rounded-xl border border-border/70 bg-secondary/30 p-3">
                  <div className="flex items-center justify-between text-xs font-medium mb-2">
                    <span className="flex items-center gap-1.5 text-foreground font-semibold">
                      <Heart className="size-3.5 text-emerald-600 fill-emerald-600" /> Interested (
                      {p.interestedUsers?.length || 0})
                    </span>
                  </div>

                  {p.interestedUsers && p.interestedUsers.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                      {p.interestedUsers.map((u: any, idx: number) => {
                        const uObj = u?.user || u;
                        const uname = uObj.username || "Anonymous";
                        const purpose = u?.purpose || "";
                        const recipientId = uObj._id || uObj.id;
                        const isGivenToThisUser =
                          p.givenTo &&
                          (p.givenTo._id === recipientId || p.givenTo === recipientId);

                        return (
                          <div
                            key={uObj._id || uObj.id || idx}
                            className="rounded-lg border border-border/50 bg-background p-2.5 text-xs transition-colors hover:bg-secondary/40 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                                  {uname.slice(0, 1)}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground truncate leading-tight">
                                    {uname}
                                  </p>
                                </div>
                              </div>

                              {(p.quantity === undefined || p.quantity > 0) &&
                              p.status !== "given" ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() =>
                                    handleGiveItem(
                                      p.UUID || p._id,
                                      recipientId,
                                      uname,
                                      p.quantity || 1
                                    )
                                  }
                                  className="h-7 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-[10px] font-semibold px-2.5 shrink-0"
                                >
                                  Give Item
                                </Button>
                              ) : isGivenToThisUser ? (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950">
                                  Recipient
                                </span>
                              ) : null}
                            </div>

                            {purpose ? (
                              <p className="text-[11px] text-muted-foreground bg-muted/40 rounded-md p-2 border border-border/30 italic">
                                "{purpose}"
                              </p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground italic">
                                No purpose details provided.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">
                      No neighbours have expressed interest yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
