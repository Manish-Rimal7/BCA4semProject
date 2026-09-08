import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Package, Plus, CheckCircle, Clock } from "lucide-react";
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

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/dashboard/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        const data = resData.responseData || resData;
        setProducts(data.products || []);
      } else {
        toast.error(resData.responseMessage || "Failed to load donations");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error loading donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
        Loading your donations…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Donations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage items you've donated to the community and review interested neighbours.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/donate">
            <Plus className="mr-2 size-4" /> Donate New Item
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Package className="mx-auto size-10 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-semibold">No donations listed yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
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
                {p.givenTo && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                    Gifted
                  </span>
                )}
              </div>

              <ItemCard item={p} onInterestToggle={fetchDonations} />

              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {p.interestedUsers?.length || 0} interested neighbour(s)
                </span>
                <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                  <Link to="/dashboard">Manage in Dashboard</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
