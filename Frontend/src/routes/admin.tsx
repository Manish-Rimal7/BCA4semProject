import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/ItemCard";
import {
  Users,
  Package,
  Clock,
  Activity,
  Check,
  X,
  ShieldAlert,
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel — Re-Nest" }],
  }),
  component: () => (
    <ProtectedRoute adminOnly>
      <AdminDashboardPage />
    </ProtectedRoute>
  ),
});

function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "users">("products");

  // Filter state for products tab
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter state for users tab
  const [userSearch, setUserSearch] = useState("");

  // Category form state
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState("");
  const [catStatus, setCatStatus] = useState("active");

  // Edit category modal state
  const [editingCat, setEditingCat] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  const API_URL = "http://localhost:8091/api";

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const [adminRes, productsRes, catsRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/products/getProducts?all=true`),
        fetch(`${API_URL}/category/getAllCategories?all=true`),
      ]);

      const adminData = await adminRes.json();
      const productsData = await productsRes.json();
      const catsData = await catsRes.json();

      if (adminRes.ok && (adminData.responseCode === 200 || adminData.responseCode === 201)) {
        setData(adminData.responseData || adminData);
      }

      if (productsRes.ok && Array.isArray(productsData.responseData)) {
        setAllProducts(productsData.responseData);
      }

      if (catsRes.ok && Array.isArray(catsData.responseData)) {
        setCategories(catsData.responseData);
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while loading admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Product Actions
  const handleApprove = async (uuid: string) => {
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/products/approveProduct/${uuid}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await response.json();
      if (response.ok) {
        toast.success("Product approved successfully!");
        fetchAdminData();
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await response.json();
      if (response.ok) {
        toast.success("Product rejected");
        fetchAdminData();
      } else {
        toast.error(resData.responseMessage || "Failed to reject product");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error rejecting product");
    }
  };

  const handleDeleteProduct = async (uuid: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/products/deleteProduct/${uuid}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await response.json();
      if (response.ok) {
        toast.success("Product deleted successfully");
        fetchAdminData();
      } else {
        toast.error(resData.responseMessage || "Failed to delete product");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product");
    }
  };

  // Category Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmittingCat(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/category/addCategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Categoryname: catName.trim(),
          status: catStatus,
        }),
      });

      const resData = await response.json();
      if (response.ok && (resData.responseCode === 200 || resData.responseCode === 201)) {
        toast.success("Category created successfully!");
        setCatName("");
        fetchAdminData();
      } else {
        toast.error(resData.responseMessage || "Failed to create category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating category");
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleStartEditCategory = (cat: any) => {
    setEditingCat(cat);
    setEditName(cat.name || "");
    setEditType(cat.categoryType || "");
    setEditStatus(cat.status || "active");
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;

    setIsSubmittingCat(true);
    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/category/updateCategory/${editingCat._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          categoryType: editType.trim(),
          status: editStatus,
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        toast.success("Category updated successfully!");
        setEditingCat(null);
        fetchAdminData();
      } else {
        toast.error(resData.responseMessage || "Failed to update category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating category");
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return;

    try {
      const token = localStorage.getItem("Re-Nest.token");
      const response = await fetch(`${API_URL}/category/deleteCategory/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await response.json();
      if (response.ok) {
        toast.success(`Category "${name}" deleted`);
        fetchAdminData();
      } else {
        toast.error(resData.responseMessage || "Failed to delete category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting category");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center text-muted-foreground">
        Loading admin control panel…
      </div>
    );
  }

  const stats = data?.statistics || {};
  const pendingProducts = data?.pendingProducts || [];
  const allUsers = data?.allUsers || data?.recentUsers || [];

  // Filter products for Tab 1
  const filteredProducts = allProducts.filter((p: any) => {
    const title = p.productName || p.title || "";
    const cat = p.productCategory || p.category || "";

    const matchesSearch =
      title.toLowerCase().includes(productSearch.toLowerCase()) ||
      cat.toLowerCase().includes(productSearch.toLowerCase());

    let matchesCategory = true;
    if (categoryFilter !== "all") {
      matchesCategory = cat.toLowerCase() === categoryFilter.toLowerCase();
    }

    let matchesStatus = true;
    if (statusFilter === "pending") {
      matchesStatus = !p.isApproved && p.approvalStatus !== "rejected";
    } else if (statusFilter === "approved") {
      matchesStatus = p.isApproved === true;
    } else if (statusFilter === "rejected") {
      matchesStatus = p.approvalStatus === "rejected";
    } else if (statusFilter === "given") {
      matchesStatus = p.status === "given" || !!p.givenTo;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filter users for Tab 3
  const filteredUsers = allUsers.filter((u: any) => {
    const username = u.username || "";
    const mail = u.mail || "";
    return (
      username.toLowerCase().includes(userSearch.toLowerCase()) ||
      mail.toLowerCase().includes(userSearch.toLowerCase())
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Admin Title */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all platform products, review approval queues, monitor users, and configure categories.
          </p>
        </div>
      </div>

      {/* NEW CATEGORY NOTIFICATION ALERT BANNER */}
      {data?.newCategoryAlerts && data.newCategoryAlerts.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 md:p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="size-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                New Category Suggestions Pending Review ({data.newCategoryAlerts.length})
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                Neighbours registered items in new categories not currently saved in MongoDB. Approving these products will automatically approve and add the category to the database.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.newCategoryAlerts.map((p: any) => (
                  <div
                    key={p.UUID || p._id}
                    className="inline-flex items-center gap-2 rounded-xl bg-background/90 border border-amber-500/30 px-3 py-1.5 text-xs shadow-xs"
                  >
                    <span>
                      Item: <strong className="text-foreground">{p.productName}</strong> by <em>{p.addedBy?.username || "Neighbour"}</em>
                    </span>
                    <span className="rounded-full bg-amber-600 text-white px-2 py-0.5 text-[10px] font-bold">
                      Category: {p.productCategory}
                    </span>
                    <Button
                      size="sm"
                      className="h-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5"
                      onClick={() => handleApprove(p.UUID)}
                    >
                      Approve Product & Category
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pendingApprovals ?? pendingProducts.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Pending Approvals</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allProducts.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Total Products</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allUsers.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Total Users</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FolderTree className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Total Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="mb-8 flex border-b border-border/80 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={cn(
            "flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative border-b-2 -mb-px",
            activeTab === "products"
              ? "border-emerald-700 text-emerald-800 dark:text-emerald-400 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Package className="size-4" />
          <span>Products Management</span>
          <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-foreground">
            {allProducts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={cn(
            "flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative border-b-2 -mb-px",
            activeTab === "categories"
              ? "border-emerald-700 text-emerald-800 dark:text-emerald-400 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FolderTree className="size-4" />
          <span>Categories Management</span>
          <span className="ml-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 text-xs font-bold">
            {categories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={cn(
            "flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative border-b-2 -mb-px",
            activeTab === "users"
              ? "border-emerald-700 text-emerald-800 dark:text-emerald-400 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="size-4" />
          <span>Users Management</span>
          <span className="ml-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 text-xs font-bold">
            {allUsers.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PRODUCTS MANAGEMENT */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products by title..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full rounded-full border border-input bg-background pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* CATEGORY FILTER DROPDOWN */}
              <div className="flex items-center gap-1.5">
                <FolderTree className="size-3.5 text-muted-foreground shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-full border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/40 capitalize"
                >
                  <option value="all">All Categories ({allProducts.length})</option>
                  {categories.map((c: any) => (
                    <option key={c._id || c.name} value={c.name.toLowerCase()}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* STATUS FILTER DROPDOWN */}
              <div className="flex items-center gap-1.5">
                <Filter className="size-3.5 text-muted-foreground shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-full border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Approval ({pendingProducts.length})</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="given">Gifted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No products match your search or status filter.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p: any) => {
                const isGivenAway = p.status === "given" || !!p.givenTo;
                return (
                  <div
                    key={p.UUID || p._id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate">
                          Added by: <strong className="text-foreground">{p.addedBy?.username || "User"}</strong>
                        </span>
                        {p.isApproved ? (
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-emerald-600 font-semibold dark:text-emerald-400">
                            Approved
                          </span>
                        ) : p.approvalStatus === "rejected" ? (
                          <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-destructive font-semibold">
                            Rejected
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-amber-600 font-semibold">
                            Pending
                          </span>
                        )}
                      </div>
                      <ItemCard item={p} onInterestToggle={fetchAdminData} />
                    </div>

                    <div className="mt-4 flex gap-2 pt-3 border-t border-border">
                      {!p.isApproved ? (
                        <Button
                          size="sm"
                          className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                          onClick={() => handleApprove(p.UUID)}
                        >
                          <Check className="mr-1 size-3.5" /> Approve
                        </Button>
                      ) : isGivenAway ? (
                        <div className="flex-1 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground text-xs font-medium px-3 py-1.5">
                          Already Gifted
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-full text-amber-600 border-amber-500/30 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/20"
                          onClick={() => handleReject(p.UUID)}
                        >
                          <X className="mr-1 size-3.5" /> Revoke
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-destructive text-xs font-semibold hover:bg-destructive/10"
                        onClick={() => handleDeleteProduct(p.UUID)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CATEGORIES MANAGEMENT */}
      {activeTab === "categories" && (
        <div className="space-y-8">
          {/* Create Category Form Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Plus className="size-5 text-emerald-600" /> Create New Category
            </h2>
            <form onSubmit={handleAddCategory} className="grid gap-4 sm:grid-cols-2 items-end">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electronics, Books, Furniture..."
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Status
                </label>
                <select
                  value={catStatus}
                  onChange={(e) => setCatStatus(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmittingCat || !catName.trim()}
                  className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold px-6"
                >
                  {isSubmittingCat ? "Creating..." : "Save Category"}
                </Button>
              </div>
            </form>
          </div>

          {/* Categories List Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/80 flex items-center justify-between">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <FolderTree className="size-4 text-primary" /> Categories ({categories.length})
              </h3>
            </div>

            {categories.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No categories created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
                    <tr>
                      <th className="p-4 font-semibold">Category Name</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {categories.map((cat: any) => (
                      <tr key={cat._id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-semibold text-foreground">{cat.name}</td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                              cat.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {cat.status || "active"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartEditCategory(cat)}
                              className="h-8 rounded-full text-xs"
                            >
                              <Edit2 className="mr-1 size-3.5" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCategory(cat._id, cat.name)}
                              className="h-8 rounded-full text-xs text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: USERS MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-full border border-input bg-background pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
              />
            </div>
            <div className="text-xs font-semibold text-muted-foreground">
              Total Members: <strong className="text-foreground">{filteredUsers.length}</strong>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/80 flex items-center justify-between">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Users className="size-4 text-emerald-600" /> Registered Community Members ({filteredUsers.length})
              </h3>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No users match your search query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
                    <tr>
                      <th className="p-4 font-semibold">User</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Address</th>
                      <th className="p-4 font-semibold text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredUsers.map((u: any) => (
                      <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-semibold text-foreground flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                            {u.username ? u.username.slice(0, 1).toUpperCase() : "U"}
                          </div>
                          <span>{u.username}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">{u.mail}</td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                              u.role === "admin"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            )}
                          >
                            {u.role || "Member"}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">{u.address || "Kathmandu"}</td>
                        <td className="p-4 text-right text-xs text-muted-foreground">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active Member"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Category Modal Dialog */}
      {editingCat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setEditingCat(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">Edit Category</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Modify category name and status.</p>

            <form onSubmit={handleUpdateCategory} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/40"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCat(null)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingCat || !editName.trim()}
                  className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold px-5"
                >
                  {isSubmittingCat ? "Saving..." : "Update Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
