import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/ItemCard";
import {
  User,
  Mail,
  ShieldCheck,
  Package,
  Heart,
  Gift,
  Star,
  Plus,
  Activity as ActivityIcon,
  Edit,
  MapPin,
  X,
  Key,
  Sun,
  Moon,
} from "lucide-react";
import { API_BASE_URL as API_URL } from "@/config/api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "User Profile — Re-Nest" }],
  }),
  component: () => (
    <ProtectedRoute>
      <UserProfilePage />
    </ProtectedRoute>
  ),
});

function UserProfilePage() {
  const { user, updateUser, toggleAdminRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [requestsData, setRequestsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAge, setEditAge] = useState<number | string>("");
  const [editPassword, setEditPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const [dashRes, reqRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/products/myRequests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dashJson = await dashRes.json();
      const reqJson = await reqRes.json();

      if (dashRes.ok && (dashJson.responseCode === 200 || dashJson.responseCode === 201)) {
        setDashboardData(dashJson.responseData || dashJson);
      }

      if (reqRes.ok && (reqJson.responseCode === 200 || reqJson.responseCode === 201)) {
        setRequestsData(reqJson.responseData || reqJson);
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error loading profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleOpenEdit = () => {
    setEditUsername(user?.username || "");
    setEditAddress(user?.address || "");
    setEditAge(user?.age || "");
    setEditPassword("");
    setIsEditOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/updateProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editUsername,
          address: editAddress,
          age: editAge,
          password: editPassword || undefined,
        }),
      });

      const resData = await response.json();
      if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        toast.success("Profile updated successfully!");
        if (resData.responseData?.user) {
          updateUser(resData.responseData.user);
        }
        setIsEditOpen(false);
        fetchProfileData();
      } else {
        toast.error(resData.responseMessage || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-muted-foreground">
        Loading user profile…
      </div>
    );
  }

  const products = dashboardData?.products || [];
  const activities = dashboardData?.activities || [];
  const requestedProducts = requestsData?.requestedProducts || [];
  const giftedProducts = requestsData?.giftedProducts || [];
  const receivedRatings = dashboardData?.receivedRatings || [];

  // Calculate average donor rating
  const avgRating =
    receivedRatings.length > 0
      ? (
          receivedRatings.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) /
          receivedRatings.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Cover / Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="h-36 bg-[image:var(--gradient-moss)] relative opacity-90" />

        <div className="relative p-6 pt-0 sm:p-8 sm:pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
            <div className="flex items-end gap-4">
              <div className="flex size-24 items-center justify-center rounded-3xl bg-card text-primary text-3xl font-bold uppercase shadow-lg ring-4 ring-background border border-border">
                {user?.username ? user.username.slice(0, 1) : "U"}
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {user?.username || "Community Member"}
                  </h1>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                    {user?.role || "Member"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="size-3.5" /> {user?.mail}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleOpenEdit} variant="outline" className="rounded-full">
                <Edit className="mr-1.5 size-4" /> Edit Profile
              </Button>
              {user?.role === "admin" && (
                <Button asChild className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
                  <Link to="/admin">
                    <ShieldCheck className="mr-1.5 size-4" /> Admin Dashboard
                  </Link>
                </Button>
              )}
              <Button asChild className="rounded-full">
                <Link to="/donate">
                  <Plus className="mr-1.5 size-4" /> Donate Item
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Metrics Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 my-8">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Items Donated</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Heart className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{requestedProducts.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Items Requested</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Gift className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{giftedProducts.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Gifts Received</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Star className="size-5 fill-current" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgRating} ★</p>
              <p className="text-xs text-muted-foreground font-medium">Donor Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info & Recent Activity Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* User Active Listings */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="size-5 text-emerald-600" /> Active Donations ({products.length})
            </h2>
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
              <Link to="/donations">Manage All</Link>
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              You haven't donated any items yet. Start giving back to your community today!
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {products.slice(0, 4).map((p: any) => (
                <ItemCard key={p.UUID || p._id} item={p} onInterestToggle={fetchProfileData} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Account Details & History */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <User className="size-4 text-emerald-600" /> Account Details
              </h3>
              <button
                onClick={handleOpenEdit}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
              >
                Edit
              </button>
            </div>
            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                  Username
                </dt>
                <dd className="font-semibold text-foreground mt-0.5">{user?.username}</dd>
              </div>
              <div className="pt-2 border-t border-border/50">
                <dt className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                  Email Address
                </dt>
                <dd className="font-semibold text-foreground mt-0.5">{user?.mail}</dd>
              </div>
              {user?.address && (
                <div className="pt-2 border-t border-border/50">
                  <dt className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                    Address / Location
                  </dt>
                  <dd className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="size-3 text-muted-foreground" /> {user.address}
                  </dd>
                </div>
              )}
              {user?.age && (
                <div className="pt-2 border-t border-border/50">
                  <dt className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                    Age
                  </dt>
                  <dd className="font-semibold text-foreground mt-0.5">{user.age} years old</dd>
                </div>
              )}
              <div className="pt-2 border-t border-border/50">
                <dt className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                  Role / Status
                </dt>
                <dd className="font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span className="capitalize">{user?.role || "Member"}</span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Theme Preference Option Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-bold flex items-center gap-2 mb-2">
              {theme === "dark" ? (
                <Moon className="size-4 text-amber-400" />
              ) : (
                <Sun className="size-4 text-amber-500" />
              )}
              Appearance Theme
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Choose your preferred visual theme for Re-Nest.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                  theme === "light"
                    ? "border-emerald-700 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-bold shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Sun className="size-5 text-amber-500" />
                <span>☀️ Light Theme</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                  theme === "dark"
                    ? "border-emerald-700 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-bold shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Moon className="size-5 text-amber-400" />
                <span>🌙 Dark Theme</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <ActivityIcon className="size-4 text-emerald-600" /> Recent Activity
            </h3>
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {activities.slice(0, 5).map((act: any) => (
                  <div
                    key={act._id}
                    className="border-b border-border/50 pb-2 last:border-0 last:pb-0"
                  >
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                      {act.action}
                    </p>
                    <p className="text-foreground mt-0.5">{act.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              disabled={isUpdating}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Edit className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Edit Profile</h3>
                <p className="text-xs text-muted-foreground">
                  Update your personal account information.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Address / Pickup Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kathmandu, Jarankhu..."
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-muted-foreground block mb-1 flex items-center gap-1">
                  <Key className="size-3 text-muted-foreground" /> New Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave empty to keep current password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isUpdating}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating || !editUsername.trim()}
                  className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold px-5"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
