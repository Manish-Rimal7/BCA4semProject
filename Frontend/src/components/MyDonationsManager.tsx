import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/Loader";
import {
  Package,
  Plus,
  CheckCircle,
  Clock,
  Heart,
  Trash2,
  Gift,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { API_BASE_URL as API_URL } from "@/config/api";
import { formatNepalDateTime } from "@/lib/utils";

interface MyDonationsManagerProps {
  initialDonations?: any[];
  onStatsChange?: (stats: { totalDonated: number; totalGiven: number }) => void;
  showDashboardLink?: boolean;
}

export function MyDonationsManager({
  initialDonations,
  onStatsChange,
  showDashboardLink = true,
}: MyDonationsManagerProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>(initialDonations || []);
  const [loading, setLoading] = useState(initialDonations === undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const onStatsChangeRef = useRef(onStatsChange);
  useEffect(() => {
    onStatsChangeRef.current = onStatsChange;
  }, [onStatsChange]);

  const hasFetchedRef = useRef(false);

  const fetchDonations = useCallback(async (isRefresh = false) => {
    const token =
      localStorage.getItem("Re-Nest.token") ||
      localStorage.getItem("token");

    if (!token) {
      setProducts([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      let list: any[] | null = null;

      // Call dedicated user donation endpoint: /api/donations/myDonations
      const res = await fetch(`${API_URL}/donations/myDonations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        const payload = data?.responseData || data;
        if (Array.isArray(payload?.donations)) {
          list = payload.donations;
        } else if (Array.isArray(payload?.products)) {
          list = payload.products;
        } else if (Array.isArray(payload)) {
          list = payload;
        } else {
          list = [];
        }
      } else {
        const errData = await res.json().catch(() => null);
        console.warn("myDonations API returned non-OK:", res.status, errData);
      }

      if (list !== null) {
        setProducts(list);
        if (onStatsChangeRef.current) {
          const totalGiven = list.filter((p: any) => p.status === "given").length;
          onStatsChangeRef.current({
            totalDonated: list.length,
            totalGiven,
          });
        }
      } else {
        toast.error("Unable to load my donations");
      }
    } catch (err) {
      console.error("fetchDonations error:", err);
      toast.error("Error loading donations. Please check connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, (user as any)?._id]);

  // Sync if parent updates initialDonations
  useEffect(() => {
    if (Array.isArray(initialDonations)) {
      setProducts(initialDonations);
      setLoading(false);
    }
  }, [initialDonations]);

  // Only perform network fetch on initial mount if parent didn't supply initialDonations
  useEffect(() => {
    if (initialDonations === undefined && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchDonations();
    }
  }, [initialDonations, fetchDonations]);

  const handleDelete = async (uuid: string, name?: string) => {
    if (!confirm(`Are you sure you want to delete "${name || 'this item'}"?`)) return;
    try {
      const token =
        localStorage.getItem("Re-Nest.token") ||
        localStorage.getItem("token");

      const response = await fetch(`${API_URL}/products/deleteProduct/${uuid}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        toast.success("Donation listing deleted successfully");
        fetchDonations(true);
      } else {
        toast.error(resData.responseMessage || "Failed to delete donation");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting donation listing");
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
      const token =
        localStorage.getItem("Re-Nest.token") ||
        localStorage.getItem("token");

      const response = await fetch(`${API_URL}/products/giveProduct/${uuid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId, quantityToGive }),
      });
      const resData = await response.json();
      if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        toast.success(
          resData.responseMessage ||
            `🎉 Successfully assigned ${quantityToGive} unit(s) to ${recipientName}!`
        );
        fetchDonations(true);
      } else {
        toast.error(resData.responseMessage || "Failed to assign item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error assigning item to recipient");
    }
  };

  // Filtered and searched donations
  const filteredProducts = products.filter((p) => {
    if (statusFilter === "AVAILABLE" && p.status === "given") return false;
    if (statusFilter === "GIVEN" && p.status !== "given") return false;
    if (statusFilter === "PENDING" && p.isApproved) return false;
    if (statusFilter === "APPROVED" && !p.isApproved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.productName || "").toLowerCase().includes(q);
      const matchCat = (p.productCategory || "").toLowerCase().includes(q);
      const matchDesc = (p.description || "").toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchDesc) return false;
    }

    return true;
  });

  const totalAvailable = products.filter((p) => p.status !== "given").length;
  const totalGiven = products.filter((p) => p.status === "given").length;
  const totalPending = products.filter((p) => !p.isApproved).length;

  if (loading) {
    return <Loader text="Loading your donation listings…" fullHeight />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="size-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">My Donations Management</h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Track and gift items you have donated ({products.length} total items listed).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDonations(true)}
            disabled={refreshing}
            className="rounded-full gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {showDashboardLink && (
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
              <Link to="/dashboard">
                Dashboard <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          )}

          <Button asChild size="sm" className="rounded-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link to="/donate">
              <Plus className="mr-1 size-3.5" /> Donate New Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            statusFilter === "ALL"
              ? "border-primary bg-primary/10 ring-1 ring-primary"
              : "border-border bg-card hover:bg-muted/50"
          }`}
        >
          <p className="text-[11px] font-medium text-muted-foreground">Total Listed</p>
          <p className="text-xl font-bold text-foreground mt-0.5">{products.length}</p>
        </button>

        <button
          onClick={() => setStatusFilter("AVAILABLE")}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            statusFilter === "AVAILABLE"
              ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
              : "border-border bg-card hover:bg-muted/50"
          }`}
        >
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Available / Active</p>
          <p className="text-xl font-bold text-foreground mt-0.5">{totalAvailable}</p>
        </button>

        <button
          onClick={() => setStatusFilter("GIVEN")}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            statusFilter === "GIVEN"
              ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500"
              : "border-border bg-card hover:bg-muted/50"
          }`}
        >
          <p className="text-[11px] font-medium text-sky-600 dark:text-sky-400">Rehomed / Given</p>
          <p className="text-xl font-bold text-foreground mt-0.5">{totalGiven}</p>
        </button>

        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            statusFilter === "PENDING"
              ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
              : "border-border bg-card hover:bg-muted/50"
          }`}
        >
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Pending Review</p>
          <p className="text-xl font-bold text-foreground mt-0.5">{totalPending}</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search my donations by name, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1 rounded-xl text-xs">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === "ALL" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter("AVAILABLE")}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === "AVAILABLE" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Available ({totalAvailable})
          </button>
          <button
            onClick={() => setStatusFilter("GIVEN")}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === "GIVEN" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Given ({totalGiven})
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              statusFilter === "PENDING" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending ({totalPending})
          </button>
        </div>
      </div>

      {/* Donations List / Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50">
          <Package className="mx-auto size-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-base font-semibold">
            {products.length === 0
              ? "No donation listings yet"
              : "No donations match your filter"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {products.length === 0
              ? "Share your pre-loved items with neighbours and give them a second life!"
              : "Try switching filters or clearing your search query to see all your items."}
          </p>
          {products.length === 0 && (
            <Button asChild className="mt-4 rounded-full text-xs bg-emerald-600 hover:bg-emerald-700">
              <Link to="/donate">Donate an Item Now</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p: any) => {
            const uuid = p.UUID || p._id;
            const isApproved = p.isApproved;
            const isGiven = p.status === "given";
            const interestedList = p.interestedUsers || [];
            const ratings = p.ratings || [];

            return (
              <div
                key={uuid}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card shadow-xs overflow-hidden transition-all hover:shadow-md"
              >
                <div>
                  {/* Status header bar */}
                  <div className="p-3 border-b border-border/60 flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-1.5">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="size-3" /> Approved & Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="size-3" /> Under Admin Review
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(uuid, p.productName)}
                      className="text-[11px] text-destructive hover:underline font-medium flex items-center gap-1 transition-colors"
                      title="Delete donation listing"
                    >
                      <Trash2 className="size-3" /> Delete
                    </button>
                  </div>

                  {/* Item Image and Basic Information */}
                  <div className="p-4 space-y-3">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted border border-border/50">
                      <img
                        src={
                          p.productImage ||
                          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=60"
                        }
                        alt={p.productName}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                            isGiven
                              ? "bg-sky-600/90 text-white"
                              : "bg-emerald-600/90 text-white"
                          }`}
                        >
                          {isGiven ? "Given Away" : "Available"}
                        </span>
                      </div>
                      {p.quantity && p.quantity > 0 && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20">
                            Qty: {p.quantity}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        <span>{p.productCategory || "General"}</span>
                        <span>•</span>
                        <span>{p.condition || "Good"}</span>
                      </div>

                      <Link
                        to="/items/$id"
                        params={{ id: uuid }}
                        className="group flex items-center justify-between mt-1"
                      >
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {p.productName}
                        </h3>
                        <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>

                      {p.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {p.description}
                        </p>
                      )}

                      {p.location && (
                        <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="size-3 shrink-0 text-emerald-600" />
                          <span className="truncate">{p.location}</span>
                        </p>
                      )}
                    </div>

                    {/* Given Status Banner */}
                    {p.givenTo && (
                      <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-2.5 text-emerald-950 dark:text-emerald-300">
                        <div className="flex items-center gap-2 text-xs font-semibold min-w-0">
                          <CheckCircle className="size-4 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            Gifted to {p.givenTo.username || "Neighbour"}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                          Given
                        </span>
                      </div>
                    )}

                    {/* Ratings / Feedback Received */}
                    {ratings.length > 0 && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                          <Star className="size-3.5 fill-amber-500 text-amber-500" />
                          Neighbour Review ({ratings.length})
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 italic line-clamp-2">
                          "{ratings[0].comment || `Rated ${ratings[0].rating}/5 stars`}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interested Neighbours & Gift Actions */}
                <div className="p-4 pt-0">
                  <div className="rounded-xl border border-border/70 bg-secondary/40 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Heart className="size-3.5 text-rose-500 fill-rose-500" />
                        Interested Neighbours ({interestedList.length})
                      </span>
                    </div>

                    {interestedList.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {interestedList.map((item: any, idx: number) => {
                          const uObj = item?.user || item;
                          const uname = uObj.username || "Neighbour";
                          const purpose = item?.purpose || "";
                          const recipientId = uObj._id || uObj.id;
                          const isGivenToThisUser =
                            p.givenTo &&
                            (p.givenTo._id === recipientId ||
                              p.givenTo === recipientId ||
                              p.givenTo.toString() === recipientId?.toString());

                          return (
                            <div
                              key={recipientId || idx}
                              className="rounded-lg border border-border/60 bg-background p-2.5 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                                    {uname.slice(0, 1)}
                                  </span>
                                  <p className="font-semibold text-foreground truncate text-xs">
                                    {uname}
                                  </p>
                                </div>

                                {!isGiven && (p.quantity === undefined || p.quantity > 0) ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() =>
                                      handleGiveItem(
                                        uuid,
                                        recipientId,
                                        uname,
                                        p.quantity || 1
                                      )
                                    }
                                    className="h-6 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-semibold px-2.5 shrink-0"
                                  >
                                    Give Item
                                  </Button>
                                ) : isGivenToThisUser ? (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                    Recipient
                                  </span>
                                ) : null}
                              </div>

                              {purpose ? (
                                <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-md p-1.5 border border-border/40 italic">
                                  "{purpose}"
                                </p>
                              ) : (
                                <p className="text-[10px] text-muted-foreground italic">
                                  Expressed interest without special note.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic py-1">
                        No neighbours have expressed interest yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
