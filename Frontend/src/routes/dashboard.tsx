import { useEffect, useState, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/Loader";
import { MyDonationsManager } from "@/components/MyDonationsManager";
import {
  Package,
  Activity as ActivityIcon,
  Plus,
  CheckCircle,
  Clock,
  Heart,
  Gift,
  LogIn,
  UserCheck,
  Star,
  ShieldCheck,
  ArrowRight,
  History,
  Sparkles,
  ExternalLink,
  Layers,
} from "lucide-react";
import { API_BASE_URL as API_URL } from "@/config/api";
import { formatNepalDateTime } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "My Dashboard & Track History — Re-Nest" }],
  }),
  component: () => (
    <ProtectedRoute>
      <UserDashboardPage />
    </ProtectedRoute>
  ),
});

function UserDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<"donations" | "history">("donations");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const handleDonationStatsChange = useCallback(
    (newStats: { totalDonated: number; totalGiven: number }) => {
      setData((prev: any) => {
        if (!prev) return prev;
        if (
          prev.stats?.totalDonated === newStats.totalDonated &&
          prev.stats?.totalGiven === newStats.totalGiven
        ) {
          return prev;
        }
        return {
          ...prev,
          stats: {
            ...prev.stats,
            totalDonated: newStats.totalDonated,
            totalGiven: newStats.totalGiven,
          },
        };
      });
    },
    []
  );

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("Re-Nest.token") ||
        localStorage.getItem("token");

      const response = await fetch(`${API_URL}/dashboard/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await response.json();
      if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        setData(resData.responseData || resData);
      } else {
        toast.error(resData.responseMessage || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    return formatNepalDateTime(dateStr);
  };

  if (loading) {
    return <Loader text="Loading your track history & dashboard…" fullHeight />;
  }

  const activities: any[] = data?.activities || [];
  const stats = data?.stats || {
    totalDonated: 0,
    totalGiven: 0,
    totalRequested: 0,
    totalReviews: 0,
    totalActivities: activities.length,
  };

  // Filter activities based on selection
  const filteredActivities = activities.filter((act) => {
    if (activeFilter === "ALL") return true;
    const actName = (act.activity || "").toUpperCase();
    if (activeFilter === "LOGINS") return actName.includes("LOGIN") || actName.includes("AUTH");
    if (activeFilter === "DONATIONS") return actName.includes("PRODUCT_ADDED") || actName.includes("DONAT");
    if (activeFilter === "REQUESTS") return actName.includes("INTEREST") || actName.includes("GIFT");
    if (activeFilter === "REVIEWS") return actName.includes("RATING") || actName.includes("REVIEW");
    return true;
  });

  const getActivityIcon = (actType: string) => {
    const t = (actType || "").toUpperCase();
    if (t.includes("LOGIN")) {
      return <LogIn className="size-4 text-sky-500" />;
    }
    if (t.includes("PRODUCT_ADDED") || t.includes("DONAT")) {
      return <Plus className="size-4 text-emerald-500" />;
    }
    if (t.includes("GIFT") || t.includes("GIVEN")) {
      return <Gift className="size-4 text-amber-500" />;
    }
    if (t.includes("INTEREST")) {
      return <Heart className="size-4 text-rose-500" />;
    }
    if (t.includes("RATING") || t.includes("REVIEW")) {
      return <Star className="size-4 text-yellow-500" />;
    }
    if (t.includes("ACCOUNT")) {
      return <UserCheck className="size-4 text-indigo-500" />;
    }
    return <ActivityIcon className="size-4 text-primary" />;
  };

  const getActivityBadgeClass = (actType: string) => {
    const t = (actType || "").toUpperCase();
    if (t.includes("LOGIN")) return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
    if (t.includes("PRODUCT_ADDED") || t.includes("DONAT")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (t.includes("GIFT") || t.includes("GIVEN")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    if (t.includes("INTEREST")) return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    if (t.includes("RATING") || t.includes("REVIEW")) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    return "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Admin Notice */}
      {user?.role === "admin" && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">You have Administrator Privileges</p>
              <p className="text-xs text-muted-foreground">
                Manage approvals, categories, user roles, and platform metrics in the Admin Dashboard.
              </p>
            </div>
          </div>
          <Button asChild size="default" className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shrink-0">
            <Link to="/admin">Open Admin Dashboard →</Link>
          </Button>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold uppercase ring-2 ring-primary/20">
            {user?.username ? user.username.slice(0, 1) : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{user?.username || "My Dashboard"}</h1>
              {user?.role === "admin" && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary uppercase">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{user?.mail}</p>
            {user?.address && (
              <p className="text-xs text-muted-foreground/80 mt-0.5">{user.address}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={mainTab === "donations" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setMainTab("donations")}
          >
            <Gift className="mr-2 size-4 text-emerald-600" /> My Donations ({stats.totalDonated || 0})
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/donate">
              <Plus className="mr-2 size-4" /> Donate New Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setMainTab("donations")}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
            mainTab === "donations"
              ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
              : "border-border bg-card hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Items Donated</p>
            <Gift className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-foreground">{stats.totalDonated || 0}</p>
          <div className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-1 font-medium">
            Manage in Dashboard <ArrowRight className="size-3" />
          </div>
        </div>

        <div
          onClick={() => setMainTab("donations")}
          className="cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-sm hover:bg-muted/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Rehomed / Given</p>
            <CheckCircle className="size-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-foreground">{stats.totalGiven || 0}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Benefited neighbours</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Expressed Interest</p>
            <Heart className="size-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-foreground">{stats.totalRequested || 0}</p>
          <Link to="/requests" className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-1">
            View My Requests <ArrowRight className="size-3" />
          </Link>
        </div>

        <div
          onClick={() => setMainTab("history")}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
            mainTab === "history"
              ? "border-primary bg-primary/10 ring-1 ring-primary"
              : "border-border bg-card hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">Total Actions Logged</p>
            <ActivityIcon className="size-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-foreground">{activities.length}</p>
          <div className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-1 font-medium">
            View Activity History <ArrowRight className="size-3" />
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMainTab("donations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mainTab === "donations"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Gift className="size-4" />
            My Donations ({stats.totalDonated || 0})
          </button>

          <button
            onClick={() => setMainTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mainTab === "history"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <History className="size-4" />
            Track History ({activities.length})
          </button>
        </div>

        <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
          <Link to="/donations">
            Open Separate Donations Page <ExternalLink className="ml-1.5 size-3.5" />
          </Link>
        </Button>
      </div>

      {/* Tab 1: My Donations Manager (In Reference of Dashboard) */}
      {mainTab === "donations" && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <MyDonationsManager
            onStatsChange={handleDonationStatsChange}
            showDashboardLink={false}
          />
        </div>
      )}

      {/* Tab 2: Activity Track History */}
      {mainTab === "history" && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <History className="size-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">User Track History</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Complete chronological record of all actions performed after logging into the platform.
              </p>
            </div>

            {/* Activity Category Filters */}
            <div className="flex flex-wrap gap-1.5 bg-secondary/50 p-1 rounded-xl text-xs">
              {[
                { id: "ALL", label: `All (${activities.length})` },
                { id: "LOGINS", label: "Logins" },
                { id: "DONATIONS", label: "Donations" },
                { id: "REQUESTS", label: "Requests" },
                { id: "REVIEWS", label: "Reviews" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeFilter === tab.id
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline List */}
          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles className="mx-auto size-10 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-semibold">No track history found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {activeFilter === "ALL"
                  ? "Actions you perform such as logging in, donating items, or expressing interest will be recorded here."
                  : `No activity found under category "${activeFilter}".`}
              </p>
            </div>
          ) : (
            <div className="mt-6 flow-root">
              <ul className="-mb-8">
                {filteredActivities.map((act: any, idx: number) => {
                  const isLast = idx === filteredActivities.length - 1;
                  return (
                    <li key={act._id || idx}>
                      <div className="relative pb-8">
                        {!isLast && (
                          <span
                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-border"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex items-start space-x-3.5">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card border border-border shadow-sm">
                            {getActivityIcon(act.activity)}
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getActivityBadgeClass(
                                    act.activity
                                  )}`}
                                >
                                  {act.activity || "ACTION"}
                                </span>
                                <p className="text-xs font-medium text-foreground">
                                  {act.details || "Activity performed on the platform"}
                                </p>
                              </div>
                              {act.product && (
                                <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                                  <Package className="size-3.5" />
                                  {typeof act.product === "object"
                                    ? act.product.productName
                                    : act.productName || "Related Item"}
                                </p>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                              {formatDate(act.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
