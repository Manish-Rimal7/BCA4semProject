import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/ItemCard";
import { Package, Activity as ActivityIcon, Plus, CheckCircle, Clock, Heart } from "lucide-react";
import { API_BASE_URL as API_URL } from "@/config/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "My Dashboard — Re-Nest" }],
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

  const fetchDashboard = async () => {
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

  const handleDelete = async (uuid: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
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
        fetchDashboard();
      } else {
        toast.error(resData.responseMessage || "Failed to delete product");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product");
    }
  };

  const handleApprove = async (uuid: string) => {
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/products/approveProduct/${uuid}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (response.ok) {
        toast.success("Product approved successfully!");
        fetchDashboard();
      } else {
        toast.error(resData.responseMessage || "Failed to approve product");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error approving product");
    }
  };

  const handleReject = async (uuid: string) => {
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/products/rejectProduct/${uuid}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const resData = await response.json();
      if (response.ok) {
        toast.success("Product rejected");
        fetchDashboard();
      } else {
        toast.error(resData.responseMessage || "Failed to reject product");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error rejecting product");
    }
  };

  const handleGiveItem = async (uuid: string, recipientId: string, recipientName: string) => {
    if (!confirm(`Are you sure you want to give this item to ${recipientName}?`)) return;
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/products/giveProduct/${uuid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId }),
      });
      const resData = await response.json();
      if (response.ok) {
        toast.success(`🎉 Item successfully assigned to ${recipientName}!`);
        fetchDashboard();
      } else {
        toast.error(resData.responseMessage || "Failed to assign item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error assigning item");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Recently" : d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  const products = data?.products || [];
  const activities = data?.activities || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Admin Notice Banner */}
      {user?.role === "admin" && (
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">🛡️ Admin Mode Active</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              You can approve, reject, or delete products directly from here or the Admin Panel.
            </span>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-full border-amber-500/40">
            <Link to="/admin">Go to Admin Panel</Link>
          </Button>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold uppercase">
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
          </div>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/donate">
            <Plus className="mr-2 size-4" /> Donate New Item
          </Link>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Products Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="size-5 text-primary" /> My Uploaded Items ({products.length})
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">You haven't uploaded any items yet.</p>
              <Button asChild variant="outline" className="mt-4 rounded-full">
                <Link to="/donate">Donate an item</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {products.map((p: any) => (
                <div key={p.UUID || p._id} className="relative flex flex-col justify-between rounded-2xl border border-border bg-card overflow-hidden p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    {p.isApproved ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="size-3.5" /> Approved & Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Clock className="size-3.5" /> Pending Admin Approval
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(p.UUID)}
                      className="text-xs text-destructive hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </div>

                  <ItemCard item={p} onInterestToggle={fetchDashboard} />

                  {/* Given To Recipient Banner */}
                  {p.givenTo && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-2.5 text-emerald-900 dark:text-emerald-300">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <CheckCircle className="size-4 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          Gifted to {p.givenTo.username || p.givenTo.mail || "Neighbour"}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-700 text-white px-2 py-0.5 rounded-full shrink-0">
                        Item Gifted
                      </span>
                    </div>
                  )}

                  {/* Interested Users Section */}
                  <div className="mt-3 rounded-xl border border-border/70 bg-secondary/30 p-3">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-foreground font-semibold">
                        <Heart className="size-3.5 text-emerald-600 fill-emerald-600" /> Interested ({p.interestedUsers?.length || 0})
                      </span>

                      {/* Avatar Stack Header */}
                      {p.interestedUsers && p.interestedUsers.length > 0 && (
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          {p.interestedUsers.slice(0, 3).map((u: any, idx: number) => {
                            const uObj = u?.user || u;
                            const uname = uObj.username || "U";
                            return (
                              <span
                                key={uObj._id || uObj.id || idx}
                                title={`${uObj.username} (${uObj.mail})`}
                                className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground ring-2 ring-background uppercase"
                              >
                                {uname.slice(0, 1)}
                              </span>
                            );
                          })}
                          {p.interestedUsers.length > 3 && (
                            <span className="inline-flex size-5 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-muted-foreground ring-2 ring-background">
                              +{p.interestedUsers.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {p.interestedUsers && p.interestedUsers.length > 0 ? (
                      <div className="mt-2.5 max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                        {p.interestedUsers.map((u: any, idx: number) => {
                          const uObj = u?.user || u;
                          const uname = uObj.username || "Anonymous";
                          const umail = uObj.mail || "";
                          const purpose = u?.purpose || "";
                          const recipientId = uObj._id || uObj.id;
                          const isGivenToThisUser =
                            p.givenTo && (p.givenTo._id === recipientId || p.givenTo === recipientId);

                          return (
                            <div
                              key={uObj._id || uObj.id || idx}
                              className="rounded-lg border border-border/50 bg-background p-2 text-xs transition-colors hover:bg-secondary/40 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                                    {uname.slice(0, 1)}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-foreground truncate leading-tight">{uname}</p>
                                    {umail && <p className="text-[10px] text-muted-foreground truncate">{umail}</p>}
                                  </div>
                                </div>

                                {!p.givenTo ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleGiveItem(p.UUID || p._id, recipientId, uname)}
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
                                <p className="text-[10px] text-muted-foreground italic">No purpose details provided.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-1 text-[11px] text-muted-foreground italic">
                        No neighbours have expressed interest yet.
                      </p>
                    )}
                  </div>

                  {/* Admin Direct Quick Actions */}
                  {user?.role === "admin" && (
                    <div className="mt-4 flex gap-2 pt-3 border-t border-border">
                      {!p.isApproved ? (
                        <Button
                          size="sm"
                          className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          onClick={() => handleApprove(p.UUID)}
                        >
                          Approve
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-full text-amber-600 border-amber-500/30 text-xs"
                          onClick={() => handleReject(p.UUID)}
                        >
                          Revoke Approval
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-destructive text-xs"
                        onClick={() => handleDelete(p.UUID)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Activity History */}
        <div>
          <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
            <ActivityIcon className="size-5 text-primary" /> Activity Log
          </h2>

          {activities.length === 0 ? (
            <div className="rounded-2xl border border-border p-6 text-center text-sm text-muted-foreground">
              No activity logged yet.
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
              {activities.map((act: any) => (
                <div key={act._id} className="border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">{act.action}</p>
                  <p className="text-xs text-foreground mt-0.5">{act.details}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDate(act.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
